import { FacebookGuard } from './guards/facebook.guard';
import { GoogleGuard } from './guards/google.guard';
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import {
  LoginDto,
  EmailDto,
  UpdatePasswordDto,
  ResetPasswordDto,
} from './dto/login.dto';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiOAuth2,
} from '@nestjs/swagger';
import response from './../../utils/response-handler';
import User from '../user/user.schema';
import { Role } from '../role/database/role.enum';
import { GetCurrentUserId } from './decorators/get-current-user-id.decorator';
import { GetCurrentUser } from './decorators/get-current-user.decorator';
import { Public } from './decorators/public.decorator';

@ApiBearerAuth()
@ApiOAuth2(['google', 'facebook'])
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Res() res: Response, @Body() registerDto: RegisterDto) {
    const user = await this.authService.register({
      registerDto,
      role: Role.User,
    });

    return this.authService.createSendToken(user, res, Role.User);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.login(loginDto);

    return this.authService.createSendToken(user, res);
  }

  @Public()
  @GoogleGuard()
  @Get('google')
  async googleAuth(@Req() req: Request) {
    return HttpStatus.OK;
  }

  @Public()
  @GoogleGuard()
  @Get('google/callback')
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.oAuth(req?.user as any);

    return this.authService.createSendToken(user, res, Role.User);
  }

  @Public()
  @FacebookGuard()
  @Get('facebook')
  async facebookAuth(@Req() req: Request) {
    return HttpStatus.OK;
  }

  @Public()
  @FacebookGuard()
  @Get('facebook/callback')
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.oAuth(req?.user as any);

    return this.authService.createSendToken(user, res, Role.User);
  }

  @Public()
  @Post('forget-password')
  async forgetPassword(
    @Body() dto: EmailDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const data = await this.authService.forgotPassword({ dto, res, req });

    let httpRes = response.success<string, any>('Token sent to email!');

    return response.send<string, any>(httpRes, res, 'read');
  }

  @Post('update-password')
  async updatePassword(
    @Body() dto: UpdatePasswordDto,
    @GetCurrentUserId() userId: string,
    @Res() res: Response,
  ) {
    const user = await this.authService.updatePassword({ userId, dto });

    return this.authService.createSendToken(user, res);
  }

  @Public()
  @Patch('reset-password/:token')
  @ApiParam({ name: 'token', type: String })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res() res: Response,
    @Param('token') token: string,
  ) {
    const user = await this.authService.resetPassword({ dto, token });

    return this.authService.createSendToken(user, res);
  }

  @Delete('delete-me')
  async deleteMe(@GetCurrentUserId() userId: string, @Res() res: Response) {
    const user = await this.authService.deleteMe(userId);

    return response.sendResponse<User, string>(user, res, 'delete', true);
  }

  @Patch('update-me')
  async updateMe(
    @GetCurrentUserId() userId: string,
    @Body() dto: Partial<RegisterDto>,
    @Res() res: Response,
  ) {
    const user = await this.authService.updateMe({ dto, userId });

    return response.sendResponse<User, string>(user, res, 'update', true);
  }

  @Get('me')
  async getProfile(@GetCurrentUser() user, @Res() res: Response) {
    return response.sendResponse<User, any>(user, res, 'read', true);
  }
}
