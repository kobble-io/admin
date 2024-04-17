import { Product } from '../products/products.types.ts';
import { Quota } from '../quotas/quota.types.ts';

export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  isVerified: boolean;
};

export type ListUsersOptions = Partial<{
  limit: number;
  page: number;
}>;

export type UserActiveProduct = Product & {
  quotas: Quota[];
};

export type GetUserQuotaUsage = {
  usage: number;
  expiresAt: Date;
  isExceeded: boolean;
  limit: number;
};
