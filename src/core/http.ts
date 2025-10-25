import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

import { logger } from "./logger";

const handleResponseError = (error: AxiosError | Error): Promise<never> => {
  const message = error.message ?? "HTTP request failed";

  if (axios.isAxiosError(error)) {
    logger.error(
      {
        err: error,
        message,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
      },
      "http: axios request failed"
    );
  } else {
    logger.error({ err: error, message }, "http: request failed");
  }

  return Promise.reject(error);
};

export type CreateHttpClientOptions = AxiosRequestConfig;

export const createHttpClient = (options: CreateHttpClientOptions = {}) => {
  const instance = axios.create(options);

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError | Error) => handleResponseError(error)
  );

  return {
    get: async <T = unknown>(
      url: string,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      const response = await instance.get<T, AxiosResponse<T>>(url, config);
      return response.data;
    },
    post: async <T = unknown, D = unknown>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>
    ): Promise<T> => {
      const response = await instance.post<T, AxiosResponse<T>, D>(
        url,
        data,
        config
      );
      return response.data;
    },
    instance,
  };
};

export const httpClient = createHttpClient();

export default httpClient;
