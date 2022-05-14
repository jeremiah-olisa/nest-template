import { ApiBody } from '@nestjs/swagger';

export const ApiFile = () =>
  ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  });
