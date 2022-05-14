import { ApiQuery } from '@nestjs/swagger';

export class ApiQueryFeature {
  name: string;
  limit: string;
  page: string;
  fields: string;
  sort: string;
}
export const ApiFeatures = () => ApiQuery({ type: ApiQueryFeature });
