import { HttpClient } from '../utils/http.ts';

export interface UsersConfig {
  http: HttpClient;
}

export type ApiUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  isVerified: boolean;
};