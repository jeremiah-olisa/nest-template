import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const FacebookGuard = () => UseGuards(AuthGuard('facebook'));
