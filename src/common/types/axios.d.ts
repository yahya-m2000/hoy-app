// Type declarations for modules that don't have built-in types
import {
  AxiosRequestConfig,
  AxiosResponse as OriginalAxiosResponse,
} from "axios";

declare module "axios" {
  export interface AxiosResponse<T = any> extends OriginalAxiosResponse<T> {}
}
