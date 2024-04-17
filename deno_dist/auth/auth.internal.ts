import { HttpClient } from '../utils/http.ts';

export type AuthConfig = {
  http: HttpClient;
  baseUrl: string;
};
