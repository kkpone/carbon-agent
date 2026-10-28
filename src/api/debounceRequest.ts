import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

let fetchThrottleApis: Map<string, Promise<AxiosResponse<unknown>>>;
// ie10 以下不支持 Map 类型。
if (Map) {
  fetchThrottleApis = new Map();
}

function debounceRequest<T>(
  options: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  if (!fetchThrottleApis) {
    return axios.request<T>(options);
  }

  const { url } = options;
  const key = `${url} ${JSON.stringify(options)}`;

  let fetchResult: Promise<AxiosResponse<T>>;

  if (fetchThrottleApis.has(key)) {
    fetchResult = fetchThrottleApis.get(key) as Promise<AxiosResponse<T>>;
  } else {
    fetchResult = axios
      .request<T>(options)
      .then(response => {
        setTimeout(() => {
          fetchThrottleApis.delete(key);
        }, 500);
        return response;
      })
      .catch(err => {
        fetchThrottleApis.delete(key);
        throw err;
      });

    fetchThrottleApis.set(key, fetchResult);
  }

  return fetchResult;
}

export default debounceRequest;
