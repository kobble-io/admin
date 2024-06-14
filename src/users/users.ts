import { Paginated } from '../common/common.types';
import {
  ApiUser,
  ListApiUserPermissionResponse,
  ListApiUserQuotaResponse,
  UsersConfig,
} from './users.internal';
import {
  UserActiveProduct,
  ListUsersOptions,
  User,
  QuotaUsage,
} from './users.types';
import { Cache } from '../utils/cache';
import { MINUTE, SECOND } from '../utils/time';
import { Permission } from '../permissions/permissions.types';

type CreateUserPayload = {
  email?: string;
  name?: string;
  phoneNumber?: string;
  metadata?: Record<string, any>;
  markEmailAsVerified?: boolean;
  markPhoneNumberAsVerified?: boolean;
};

export class KobbleUsers {
  private permissionsCache = new Cache<Permission[]>({
    defaultTtl: (1 * MINUTE) / SECOND,
  });

  private quotasCache = new Cache<QuotaUsage[]>({
    defaultTtl: (1 * MINUTE) / SECOND,
  });

  constructor(private readonly config: UsersConfig) {}

  private userCacheKey(userId: string) {
    return `user:${userId}`;
  }

  private transformApiUser(apiUser: ApiUser): User {
    return {
      ...apiUser,
      metadata: apiUser.metadata === null ? {} : apiUser.metadata,
      createdAt: new Date(apiUser.createdAt),
    };
  }

  /**
   * Create a new user on your Kobble instance manually.
   *
   * While both email and phoneNumber are optional, at least one of them must be provided.
   *
   * If an email is provided, it will be marked as verified by default.
   *
   * Note that the phone number should be in E.164 format (e.g. +14155552671). Other formats will be rejected.
   */
  async create(payload: CreateUserPayload): Promise<User> {
    const res = await this.config.http.postJson<ApiUser>(
      '/users/create',
      payload,
    );

    return this.transformApiUser(res);
  }

  async getById(
    id: string,
    options: { includeMetadata?: boolean } = {},
  ): Promise<User> {
    const { includeMetadata = false } = options;
    const payload = await this.config.http.getJson<ApiUser>('/users/findById', {
      userId: id,
      includeMetadata,
    });

    return this.transformApiUser(payload);
  }

  async findByMetadata(
    metadata: Record<string, string>,
    options: { page?: number; limit?: number } = {},
  ): Promise<Paginated<User>> {
    const { page = 1, limit = 50 } = options;
    const payload = await this.config.http.postJson<Paginated<ApiUser>>(
      '/users/findByMetadata',
      {
        metadata,
        page,
        limit,
      },
    );

    return {
      ...payload,
      data: payload.data.map((u) => this.transformApiUser(u)),
    };
  }

  async patchMetadata(userId: string, metadata: Record<string, any>) {
    const { metadata: newMetadata } = await this.config.http.postJson<{
      metadata: Record<string, any>;
    }>('/users/patchMetadata', {
      userId,
      metadata,
    });

    return { metadata: newMetadata };
  }

  async updateMetadata(userId: string, metadata: Record<string, any>) {
    await this.config.http.postJson('/users/updateMetadata', {
      userId,
      metadata,
    });

    return { metadata };
  }

  async listAll(options: ListUsersOptions = {}): Promise<Paginated<User>> {
    const { page = 1, limit = 50, includeMetadata = false } = options;
    const payload = await this.config.http.getJson<Paginated<ApiUser>>(
      '/users/list',
      { page, limit, includeMetadata },
    );

    return {
      ...payload,
      data: payload.data.map((u) => this.transformApiUser(u)),
    };
  }

  /**
   * Retrieves the active product a given user is assigned to.
   *
   * @param {string} userId - The unique identifier for the user whose active product is being retrieved.
   * @returns {Promise UserActiveProduct | null} A promise that resolves to the active product assigned to the user, or null if the user has no active product.
   */
  async getActiveProduct(userId: string): Promise<UserActiveProduct | null> {
    const payload = await this.config.http.getJson<{
      products: UserActiveProduct[];
    }>('/users/listActiveProducts', {
      userId,
    });

    if (payload.products?.length) {
      return payload.products[0];
    }

    return null;
  }

  private async getCachedUserPerms(
    userId: string,
  ): Promise<Permission[] | null> {
    const cacheKey = this.userCacheKey(userId);

    return this.permissionsCache.get(cacheKey);
  }

  private async getCachedUserQuotas(
    userId: string,
  ): Promise<QuotaUsage[] | null> {
    const cacheKey = this.userCacheKey(userId);

    return this.quotasCache.get(cacheKey);
  }

  /**
   * Retrieves the list of quota usages for a given user based on the product assigned to them.
   *
   * @param {string} userId - The unique identifier for the user whose quota usage is being retrieved.
   * @param {Object} [options] - Configuration options for retrieving the quotas.
   * @param {boolean} [options.noCache=false] - Set to true to bypass cache and fetch fresh data.
   * @returns {Promise QuotaUsage[]>} A promise that resolves to an array of QuotaUsage objects, each representing a quota for the user.
   */
  async listQuotas(
    userId: string,
    options?: {
      noCache?: boolean;
    },
  ): Promise<QuotaUsage[]> {
    const cached = await this.getCachedUserQuotas(userId);

    if (cached && !options?.noCache) {
      return cached;
    }

    const { quotas } = await this.config.http.getJson<ListApiUserQuotaResponse>(
      '/users/listQuotas',
      { userId },
    );

    return quotas.map((quota) => ({
      ...quota,
      expiresAt: new Date(quota.expiresAt),
    }));
  }

  /**
   * Asynchronously increments the quota usage for a specific user and quota.
   * This function allows incrementing a user's quota usage by a specified amount,
   * which defaults to 1 if not provided.
   *
   * @param {string} userId - The unique identifier for the user whose quota is being incremented.
   * @param {string} quotaName - The name of the quota to increment.
   * @param {Object} options - The options for incrementing the quota.
   * @param {number} [options.incrementBy=1] - The amount by which to increment the quota usage. Optional and defaults to 1.
   * @returns {Promise<void>} A promise that resolves when the quota increment operation is complete.
   */
  async incrementQuotaUsage(
    userId: string,
    quotaName: string,
    options?: {
      incrementBy?: number;
    },
  ): Promise<void> {
    const incrementBy = options?.incrementBy ?? 1;

    await this.config.http.postJson('/quotas/incrementUsage', {
      userId,
      quotaName,
      incrementBy,
    });
  }

  /**
   * Asynchronously decrements the quota usage for a specific user and quota.
   * This function allows decrementing a user's quota usage by a specified amount,
   * which defaults to 1 if not provided.
   *
   * @param {string} userId - The unique identifier for the user whose quota is being incremented.
   * @param {string} quotaName - The name of the quota to increment.
   * @param {Object} options - The options for incrementing the quota.
   * @param {number} [options.incrementBy=1] - The amount by which to increment the quota usage. Optional and defaults to 1.
   * @returns {Promise<void>} A promise that resolves when the quota increment operation is complete.
   */
  async decrementQuotaUsage(
    userId: string,
    quotaName: string,
    options?: {
      decrementBy?: number;
    },
  ): Promise<void> {
    const decrementBy = options?.decrementBy ?? 1;

    const incrementBy = decrementBy > 0 ? -decrementBy : decrementBy;

    await this.config.http.postJson('/quotas/incrementUsage', {
      userId,
      quotaName,
      incrementBy,
    });
  }

  /**
   * Asynchronously set the quota usage for a given user to a given number.
   * Unlike incrementQuotaUsage and decrementQuotaUsage,
   * this will set the usage to the specific number.
   * @param {string} userId - The unique identifier for the user whose quota is being changed.
   * @param {string} quotaName - The name of the quota to change.
   * @param {number} usage - The new usage you want to set
   * @param {Object} options - The options for incrementing the quota.
   * @returns {Promise<void>} A promise that resolves when the quota increment operation is complete.
   */
  async setQuotaUsage(
    userId: string,
    quotaName: string,
    usage: number,
  ): Promise<void> {
    await this.config.http.postJson('/quotas/setUsage', {
      userId,
      quotaName,
      usage,
    });
  }

  async getQuota(
    userId: string,
    quotaName: string,
  ): Promise<QuotaUsage | null> {
    const quotas = await this.listQuotas(userId);

    return quotas.find((q) => q.name === quotaName) ?? null;
  }

  /**
   * Retrieves the list of permissions for a given user based on the product assigned to them.
   *
   * @param {string} userId - The unique identifier for the user whose permissions are being retrieved.
   * @param {Object} [options] - Configuration options for retrieving the permissions.
   * @param {boolean} [options.noCache=false] - Set to true to bypass cache and fetch fresh data.
   * @returns {Promise Permission[]>} A promise that resolves to an array of Permission objects.
   */
  async listPermissions(
    userId: string,
    options?: {
      noCache?: boolean;
    },
  ): Promise<Permission[]> {
    const cached = await this.getCachedUserPerms(userId);

    if (cached && !options?.noCache) {
      return cached;
    }

    const { permissions } =
      await this.config.http.getJson<ListApiUserPermissionResponse>(
        '/users/listPermissions',
        { userId },
      );

    return permissions.map((p) => ({
      name: p.name,
    }));
  }

  /**
   * Checks if a user has remaining credit for all specified quota(s).
   *
   * @param {string} userId - The unique identifier for the user whose quotas are being checked.
   * @param {string[]} quotaNames - The names of the quotas to check. Can be a single name or an array of names.
   * @param {Object} [options] - Configuration options for checking the quotas.
   * @param {boolean} [options.noCache=false] - Set to true to bypass cache and fetch fresh data.
   * @returns {Promise<boolean>} A promise that resolves to true if the user has remaining credit for all quotas, false otherwise.
   */
  async hasRemainingQuota(
    userId: string,
    quotaNames: string[] | string,
    options?: {
      noCache?: boolean;
    },
  ): Promise<boolean> {
    const quotas = await this.listQuotas(userId, options);

    const names = typeof quotaNames === 'string' ? [quotaNames] : quotaNames;

    return names.every((quotaName) => {
      const quota = quotas.find((q) => q.name === quotaName);
      return (quota?.remaining ?? 0) > 0;
    });
  }

  /**
   * Checks if a user has all permissions specified as arguments.
   *
   * @param {string} userId - The unique identifier for the user whose quotas are being checked.
   * @param {string[] | string} permissionNames - The names of the permission(s) to check. Can be a single permission name or an array of name.
   * @param {Object} [options] - Configuration options for checking the quotas.
   * @param {boolean} [options.noCache=false] - Set to true to bypass cache and fetch fresh data.
   * @returns {Promise<boolean>} A promise that resolves to true if the user has all permissions, false otherwise.
   */
  async hasPermission(
    userId: string,
    permissionNames: string[] | string,
    options?: {
      noCache?: boolean;
    },
  ): Promise<boolean> {
    const permissions = await this.listPermissions(userId, options);

    const names =
      typeof permissionNames === 'string' ? [permissionNames] : permissionNames;

    return names.every((permissionName) => {
      const permission = permissions.find((p) => p.name === permissionName);

      return !!permission;
    });
  }

  /**
   * This function is a helper to check if a user has all permissions and quotas specified in the payload.
   * If both permissionNames and quotaNames are provided, the user must have all permissions and quotas to be allowed.
   * If only permissionNames are provided, the user must have all permissions to be allowed.
   * If only quotaNames are provided, the user must have all quotas to be allowed.
   *
   * @param {string} userId - The unique identifier for the user whose quotas are being checked.
   * @param {Object} payload - The payload containing the permission and quota names to check.
   * @param {string[]} [payload.permissionNames] - The names of the permissions to check.
   * @param {string[]} [payload.quotaNames] - The names of the quotas to check.
   * @param {Object} [options] - Configuration options for checking the quotas and permissions.
   * @param {boolean} [options.noCache=false] - Set to true to bypass cache and fetch fresh data.
   * @returns {Promise<boolean>} A promise that resolves to true if the user has all permissions and quotas, false otherwise.
   */
  async isAllowed(
    userId: string,
    payload: {
      permissionNames?: string[];
      quotaNames?: string[];
    },
    options?: {
      noCache?: boolean;
    },
  ): Promise<boolean> {
    const { permissionNames, quotaNames } = payload;

    if (permissionNames?.length && quotaNames?.length) {
      const hasPermissions = await this.hasPermission(
        userId,
        permissionNames,
        options,
      );
      const hasQuotas = await this.hasRemainingQuota(
        userId,
        quotaNames,
        options,
      );

      return hasPermissions && hasQuotas;
    }

    if (permissionNames?.length) {
      return this.hasPermission(userId, permissionNames);
    }

    if (quotaNames?.length) {
      return this.hasRemainingQuota(userId, quotaNames);
    }

    return false;
  }

  /**
   * This function is a helper to check if a user is forbidden from performing an action.
   * It is the opposite of isAllowed.
   *
   * @param {string} userId - The unique identifier for the user whose quotas are being checked.
   * @param {Object} payload - The payload containing the permission and quota names to check.
   * @param {string[]} [payload.permissionNames] - The names of the permissions to check.
   * @param {string[]} [payload.quotaNames] - The names of the quotas to check.
   * @param {Object} [options] - Configuration options for checking the quotas and permissions.
   * @param {boolean} [options.noCache=false] - Set to true to bypass cache and fetch fresh data.
   * @returns {Promise<boolean>} A promise that resolves to true if the user is forbidden from performing the action, false otherwise.
   */
  async isForbidden(
    userId: string,
    payload: {
      permissionNames?: string[];
      quotaNames?: string[];
    },
    options?: {
      noCache?: boolean;
    },
  ): Promise<boolean> {
    return !this.isAllowed(userId, payload, options);
  }
}
