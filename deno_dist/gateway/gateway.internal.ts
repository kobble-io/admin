import { HttpClient } from '../utils/http.ts';

export interface GatewayConfig {
  http: HttpClient;
}

export type RawTokenPayload = {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  user: {
    email: string;
    id: string;
    name: string | null;
    products: Array<{
      id: string;
      quotas: Array<{
        id: string;
        name: string;
        used: number;
        limit: number;
      }>;
    }>;
  };
};
