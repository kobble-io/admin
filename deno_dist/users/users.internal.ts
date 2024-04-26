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

export type ApiUserQuota = {
  name: string;
  usage: number;
  expiresAt: string;
  remaining: number;
  limit: number;
};

export type ListApiUserQuotaResponse = {
  quotas: ApiUserQuota[];
};

export type ApiPermission = {
  id: string;
  name: string;
};

export type ListApiUserPermissionResponse = {
  permissions: ApiPermission[];
};
