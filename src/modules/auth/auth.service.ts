import { routePrefix } from './../../main';
import { EmailService } from './../email/email.service';
import { Role } from '../role/database/role.enum';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import {
  LoginDto,
  EmailDto,
  UpdatePasswordDto,
  ResetPasswordDto,
  OAuthUser,
} from './dto/login.dto';
import {
  Injectable,
  HttpStatus,
  HttpException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import response from './../../utils/response-handler';
import { JwtService } from '@nestjs/jwt';
import User from '../user/user.schema';
import { default as RoleModel } from '../role/database/role.schema';
import { Response as HttpResponse } from 'express';
import Payload from './../../common/types/payload.type';
import { flattenRole, UserService } from '../user/user.service';
import { Request } from 'express';
import * as crypto from 'crypto';
import * as _ from 'lodash';

// type UserToken = User & { token: string };
type Token = { token: string };

@Injectable()
export class AuthService {
  public readonly JWT_SECRET;
  private readonly JWT_COOKIE_EXPIRES_IN;
  private readonly JWT_EXPIRES_IN;
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(RoleModel.name) private readonly roleModel: Model<RoleModel>,
  ) {
    this.JWT_SECRET = this.configService.get<string>('JWT_SECRET');
    this.JWT_COOKIE_EXPIRES_IN = this.configService.get<number>(
      'JWT_COOKIE_EXPIRES_IN',
    );
    this.JWT_EXPIRES_IN = this.configService.get<string>('JWT_EXPIRES_IN');
  }

  async signToken(payload: Payload): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }

  async createSendToken(
    user: User | any,
    res: HttpResponse,
    role?: Role,
  ): Promise<HttpResponse<any, Record<string, any>>> {
    user = user?._doc || user;

    if (!user?._id) throw new UnauthorizedException('Invalid User');

    console.log(role, user?.roles);

    const roles = user?.roles ? flattenRole(user?.roles) : [role];

    let payload: Payload = { _id: user._id, roles };
    // console.log(payload);

    const token = await this.signToken(payload);
    // region comments
    // const cookieOptions = {
    //   expires: new Date(
    //     Date.now() + this.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    //   ),
    //   httpOnly: true,
    //   secure: false,
    // };

    // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    // res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    // endregion comments
    // user.password = undefined;
    user = _.omit(user, [
      'password',
      'mailConfirmed',
      'active',
      'createdAt',
      'updatedAt',
      '__v',
    ]);
    user.roles = roles;

    // console.log('user?.address', user?.address)
    let httpRes = response.success<User, Token>({ ...user }, { token });

    return response.send<User, Token>(httpRes, res, 'read');
  }

  async register({
    registerDto,
    role,
  }: {
    registerDto: RegisterDto;
    role: Role;
  }): Promise<User & { _id: any }> {
    // let findPhoneNumber = await this.userModel.exists({ phone: registerDto.phone });
    // if (findPhoneNumber) throw new HttpException("Phone number has been used by another user", HttpStatus.BAD_REQUEST);
    // let findEmail = await this.userModel.exists({ email: registerDto.email });

    if (await this.userModel.exists({ email: registerDto.email }))
      throw new HttpException(
        'Email has been used by another user',
        HttpStatus.BAD_REQUEST,
      );
    // create user
    let newUser = await this.userModel.create(registerDto);
    newUser = await this.userService.addUserToRole(newUser, role);
    // console.log(newUser)
    return newUser;
  }

  async oAuth(
    user: OAuthUser,
    role: Role = Role.User,
  ): Promise<User & { _id: any }> {
    if (!user || !user?.email || !user?.accessToken)
      throw new UnauthorizedException('Invalid User');
    if (user?.accessToken) user.accessToken = undefined;

    const userExists = await this.userModel.exists({ email: user?.email });
    const { email } = user;
    let _user: User & { _id: any };

    console.log({ user, userExists });

    if (userExists == null || !userExists) {
      // TODO: ask if email should be confirmed when using oauth, user email might not be in use
      if (email)
        _user = await this.userModel.create({ ...user, mailConfirmed: true });
      if (_user) _user = await this.userService.addUserToRole(_user, role);
    } else {
      if (email)
        _user = await this.userModel
          .findOne({ email, active: { $ne: false } })
          .select({
            mailConfirmed: 0,
            active: 0,
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
          })
          .populate('roles', { name: 1, _id: 0 }, RoleModel.name);
    }
    // create user
    // console.log(newUser)
    return _user;
  }

  async login(loginDto: LoginDto): Promise<User & { _id: any }> {
    if (!loginDto.email || !loginDto.password) {
      throw new HttpException(
        'Please provide email and password!',
        HttpStatus.BAD_REQUEST,
      );
    }
    // 2) Check if user exists && password is correct
    const user = await this.userModel
      .findOne({ email: loginDto.email, active: { $ne: false } })
      .select({
        mailConfirmed: 0,
        active: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      })
      .populate('roles', { name: 1, _id: 0 }, RoleModel.name);

    // console.log("user", user);
    if (user && !user?.password)
      throw new ForbiddenException(
        'Use your either your google or facebook accounts to login',
      );
    if (
      !user ||
      !(await user.correctPassword(loginDto.password, user.password))
    )
      throw new UnauthorizedException(
        'Please provide a valid email and password!',
      );

    // 3) If everything ok, send user doc
    // user.password = undefined;
    return user;
  }

  async forgotPassword({
    dto,
    res,
    req,
  }: {
    dto: EmailDto;
    res: HttpResponse;
    req: Request;
  }): Promise<boolean> {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user)
      throw new UnauthorizedException('There is no user with email address.');

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${dto.redirectUrl}/${resetToken}`;

    const message = `Forgot your password? Click on the url to reset your password: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      // await mailer.send({
      //     email: user.email,
      //     subject: 'Your password reset token (valid for 10 min)',
      //     message
      // });

      await this.emailService.sendMail({
        to: user.email,
        subject: 'Reset Password',
        text: message,
        html: message,
      });
      return true;
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new HttpException(
        'There was an error sending the email. Try again later!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePassword({
    userId,
    dto,
  }: {
    userId: string;
    dto: UpdatePasswordDto;
  }): Promise<User & { _id: any }> {
    const user = await this.userModel.findById(userId).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(dto.currentPassword, user.password)))
      throw new UnauthorizedException('Your current password is wrong.');

    if (dto.confirmNewPassword !== dto.newPassword)
      throw new BadRequestException(
        'Confirm password and new password do not match.',
      );
    // 3) If so, update password
    user.password = dto.newPassword;

    return await user.save();
  }

  async resetPassword({
    dto,
    token,
  }: {
    dto: ResetPasswordDto;
    token: string;
  }) {
    if (dto.confirmNewPassword !== dto.newPassword)
      throw new BadRequestException(
        'Confirm password and new password do not match.',
      );

    // 1) Get user based on the token
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.userModel.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user)
      throw new UnauthorizedException('Token is invalid or has expired');

    user.password = dto.newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    return await user.save();
  }

  async deleteMe(userId: string): Promise<User & { _id: any }> {
    return await this.userModel.findByIdAndUpdate(userId, { active: false });
  }

  async updateMe({
    dto,
    userId,
  }: {
    dto: Partial<RegisterDto>;
    userId: string;
  }): Promise<User & { _id: any }> {
    if (dto.password)
      throw new ForbiddenException(
        'This route is not for password updates. Please use the correct route.',
      );

    return await this.userModel.findByIdAndUpdate(userId, dto, {
      new: true,
      runValidators: true,
    });
  }
}
