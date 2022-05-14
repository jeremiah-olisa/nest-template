export type Response<TData, TMeta> = {
  success: boolean;
  message: string;
  data: TData;
} & TMeta;
