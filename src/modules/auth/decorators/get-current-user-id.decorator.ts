import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { JwtPayload } from '../../auth/types';

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as any;
    return user._id;
  },
);
