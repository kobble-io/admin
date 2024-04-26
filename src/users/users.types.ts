import { Product } from '../products/products.types';
import { Quota } from '../quotas/quota.types';
import { Permission } from '../permissions/permissions.types';

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

export type UserActiveProduct = Product;

export type QuotaUsage = {
  name: string;
  usage: number;
  expiresAt: Date;
  remaining: number | null;
  limit: number | null;
};
