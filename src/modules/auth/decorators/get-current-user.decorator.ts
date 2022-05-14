import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { JwtPayloadWithRt } from '../../auth/types';

export const GetCurrentUser = createParamDecorator(
  (data: keyof any | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    // console.log(data);
    if (!data) return request.user;
    return request.user;
  },
);
