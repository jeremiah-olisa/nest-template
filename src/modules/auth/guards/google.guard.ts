import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const GoogleGuard = () => UseGuards(AuthGuard('google'));
