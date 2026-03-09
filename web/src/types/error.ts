export type FastifyGeneralError = {
  message: string;
  code: string;
  sacl?: string;
};

export type ValidationErrorItem = {
  origin: string;
  code: string;
  minimum?: number;
  maximum?: number;
  inclusive?: boolean;
  path: string[];
  message: string;
};

export type ValidationErrorResponse = {
  message: "validation_error";
  error: ValidationErrorItem[];
};

export type ApiErrorResponse = {
  message: string;
  error?: ValidationErrorItem[];
};
