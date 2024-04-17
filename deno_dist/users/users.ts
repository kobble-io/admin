import { Paginated } from '../common/common.types.ts';
import { ApiUser, UsersConfig } from './users.internal.ts';
import {
  UserActiveProduct,
  ListUsersOptions,
  User,
  GetUserQuotaUsage,
} from './users.types.ts';

export class KobbleUsers {
  constructor(private readonly config: UsersConfig) {}

  private transformApiUser(apiUser: ApiUser): User {
    return {
      ...apiUser,
      createdAt: new Date(apiUser.createdAt),
    };
  }

  async findUnique(id: string): Promise<User> {
    const payload = await this.config.http.getJson<ApiUser>('/users/findById', {
      userId: id,
    });

    return this.transformApiUser(payload);
  }

  async list(options: ListUsersOptions = {}): Promise<Paginated<User>> {
    const { page = 1, limit = 50 } = options;
    const payload = await this.config.http.getJson<Paginated<ApiUser>>(
      '/users/list',
      { page, limit },
    );

    return {
      ...payload,
      data: payload.data.map((u) => this.transformApiUser(u)),
    };
  }

  async listActiveProducts(id: string): Promise<UserActiveProduct[]> {
    const payload = await this.config.http.getJson<{
      products: UserActiveProduct[];
    }>('/users/listActiveProducts', {
      userId: id,
    });

    return payload.products;
  }

  async incrementQuotaUsage(
    id: string,
    quotaId: string,
    incrementBy = 1,
  ): Promise<void> {
    await this.config.http.postJson('/users/incrementQuotaUsage', {
      userId: id,
      quotaId,
      incrementBy,
    });
  }

  async setQuotaUsage(
    id: string,
    quotaId: string,
    usage: number,
  ): Promise<void> {
    await this.config.http.postJson('/users/setQuotaUsage', {
      userId: id,
      quotaId,
      usage,
    });
  }

  async getQuotaUsage(id: string, quotaId: string): Promise<GetUserQuotaUsage> {
    const { usage, limit, expiresAt, isExceeded } =
      await this.config.http.getJson<{
        usage: number;
        expiresAt: string;
        isExceeded: boolean;
        limit: number;
      }>('/users/getQuotaUsage', {
        userId: id,
        quotaId,
      });

    return { usage, limit, expiresAt: new Date(expiresAt), isExceeded };
  }
}
