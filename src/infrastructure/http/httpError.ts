import axios from "axios";

export type HttpError = {
  message: string;
  status?: number;
};

export function toHttpError(error: unknown): HttpError {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message ?? error.message,
      status: error.response?.status,
    };
  }
  return error instanceof Error ? { message: error.message } : { message: "Unknown network error" };
}
