import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  // #region decorators
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  // #endregion
  email: string;

  // #region decorators
  @IsNotEmpty()
  @ApiProperty()
  // #endregion
  password: string;
}
