import { HttpClient } from '../utils/http';

export type AuthConfig = {
  http: HttpClient;
  baseUrl: string;
};
