import { ApiErrorResponseData } from 'api/dist/error/types';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import {
  GetRecoilValue,
  RecoilValue,
  selectorFamily,
  SerializableParam,
  useRecoilValue,
} from 'recoil';
import { SessionToken } from './auth';
import { EthState } from './eth';
type RequestParams = {
  [key: string]: SerializableParam;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: any;
};

type RequestDataParam = {
  data: string;
};

type PatchRequestParams = RequestParams & RequestDataParam;
type PostRequestParams = RequestParams & RequestDataParam;

const parseData = function (data: string): unknown {
  try {
    const parsedData = JSON.parse(data);
    return parsedData;
  } catch (err) {
    throw new Error('Invalid request data format.');
  }
};

export const isResponseOk = (
  response: AxiosResponse | AxiosError | null | unknown
): response is AxiosResponse => {
  const axiosResponse = response as AxiosResponse;
  if (!axiosResponse) return false;
  return axiosResponse.status === 200;
};

export const isApiResponseAxiosError = (
  axiosResponse: AxiosResponse | AxiosError | null | unknown
): axiosResponse is AxiosError<ApiErrorResponseData> => {
  return (
    axiosResponse !== null &&
    (axiosResponse as AxiosError).isAxiosError !== undefined
  );
};

export const isApiResponseValidationError = (
  axiosResponse: AxiosResponse | AxiosError | null | unknown
): axiosResponse is AxiosError<ApiErrorResponseData> => {
  return (
    isApiResponseAxiosError(axiosResponse) &&
    axiosResponse.response?.status === 400 &&
    axiosResponse.response.data.errors
  );
};

const endpointUrl = (url: string): string => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Backend URL not set.');
  }
  return `${backendUrl}${url}`;
};

const requestConfig = (
  config: AxiosRequestConfig,
  headers: Record<string, string>
): AxiosRequestConfig => {
  return {
    ...config,
    headers: {
      ...headers,
    },
  };
};

const authRequestConfig = (
  config: AxiosRequestConfig,
  headers: Record<string, string>,
  get: GetRecoilValue
): AxiosRequestConfig => {
  const ethState = get(EthState);
  const sessionToken = get(SessionToken);
  if (!ethState.account) {
    throw new Error('Eth account not connected.');
  }
  if (!(typeof sessionToken === 'string')) {
    throw new Error('No session token found.');
  }
  return {
    ...config,
    headers: {
      ...headers,
      Authorization: `Bearer ${sessionToken}`,
    },
  };
};

/**
 * GET request
 */
export const ApiGet = selectorFamily<AxiosResponse<unknown>, RequestParams>({
  key: 'ApiGet',
  get: (params: RequestParams) => async (): Promise<AxiosResponse<unknown>> => {
    const { config, headers, url } = params;
    const response = await axios.get(
      endpointUrl(url),
      requestConfig(config, headers)
    );
    return response;
  },
});

/**
 * Authenticated GET request
 */
export const ApiAuthGet = selectorFamily<AxiosResponse<unknown>, RequestParams>(
  {
    key: 'ApiAuthGet',
    get:
      (params: RequestParams) =>
      async ({ get }): Promise<AxiosResponse<unknown>> => {
        const { config, headers, url } = params;
        const response = await axios.get(
          endpointUrl(url),
          authRequestConfig(config, headers, get)
        );
        return response;
      },
  }
);

/**
 * POST request
 */
export const ApiPost = selectorFamily<
  AxiosResponse<unknown>,
  PostRequestParams
>({
  key: 'ApiPost',
  get:
    (params: PostRequestParams) =>
    async (): Promise<AxiosResponse<unknown>> => {
      const { config, headers, url, data } = params;
      const response = await axios.post(
        endpointUrl(url),
        parseData(data),
        requestConfig(config, headers)
      );
      return response;
    },
});

/**
 * Authenticated POST request
 */
export const ApiAuthPost = selectorFamily<
  AxiosResponse<unknown>,
  PostRequestParams
>({
  key: 'ApiAuthPost',
  get:
    (params: PostRequestParams) =>
    async ({ get }): Promise<AxiosResponse<unknown>> => {
      const { config, headers, url, data } = params;
      const response = await axios.post(
        endpointUrl(url),
        parseData(data),
        authRequestConfig(config, headers, get)
      );
      return response;
    },
});

/**
 * An authenticated PATCH request
 */
export const ApiAuthPatch = selectorFamily<
  AxiosResponse<unknown>,
  PatchRequestParams
>({
  key: 'ApiAuthPatch',
  get:
    (params: PatchRequestParams) =>
    async ({ get }): Promise<AxiosResponse<unknown>> => {
      const { config, headers, url, data } = params;
      const response = await axios.patch(
        endpointUrl(url),
        parseData(data),
        authRequestConfig(config, headers, get)
      );
      return response;
    },
});

interface HandleErrorsOptions {
  errorToast?: boolean;
}

export const handleErrors = (
  err: AxiosError<ApiErrorResponseData>,
  options?: HandleErrorsOptions
): void => {
  // client received an error response (5xx, 4xx)
  const { request, response } = err;
  if (response) {
    if (response.status === 404) {
      window.location.href = '/404';
    }

    if (response.data.message) {
      if (!options || options.errorToast === false) {
        toast.error(response.data.message);
      }
      return;
    }
    // TODO Handle expired JWT token
  }

  if (request) {
    // client never received a response, or request never left
    if (err.message) {
      toast.error(err.message);
      return;
    }
  }

  toast.error('Unknown error.');
};

interface ApiQueryOptions {
  errorToast?: boolean;
}

/**
 * Wrap an api request to automate error handling. Shows toast error message on error.
 */
export const ApiQuery = async (
  query: Promise<AxiosResponse<unknown>>,
  options?: ApiQueryOptions
): Promise<AxiosResponse<unknown> | AxiosError<unknown>> => {
  try {
    return await query;
  } catch (err) {
    if (isApiResponseAxiosError(err)) {
      handleErrors(err, options);
    }
    return err as AxiosError;
  }
};

/**
 * Always use `useAuthApiQuery` for queries instead of `useRecoilValue`
 * to correctly handle expired JWT tokens and other error codes returned by
 * the server
 */
export function useAuthApiQuery<T>(recoilValue: RecoilValue<T>): T {
  const response = useRecoilValue(recoilValue);
  if (isApiResponseAxiosError(response)) {
    handleErrors(response);
  }
  return response;
}
