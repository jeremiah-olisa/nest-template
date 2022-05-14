import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsUrl } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @ApiProperty()
  confirmNewPassword: string;
  @IsNotEmpty()
  @ApiProperty()
  newPassword: string;
}

export class OAuthUser {
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  profilePicture?: { url?: string };
  accessToken: string;
}

export class UpdatePasswordDto extends ResetPasswordDto {
  @IsNotEmpty()
  @ApiProperty()
  currentPassword: string;
}

export class EmailDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsUrl()
  @ApiProperty()
  redirectUrl: string;
}
