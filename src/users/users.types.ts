import { Product } from '../products/products.types';

export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  isVerified: boolean;
  metadata: Record<string, any>;
};

export type ListUsersOptions = Partial<{
  limit?: number;
  page?: number;
  includeMetadata?: boolean;
}>;

export type UserActiveProduct = Product;

export type QuotaUsage = {
  name: string;
  usage: number;
  expiresAt: Date;
  remaining: number | null;
  limit: number | null;
};
