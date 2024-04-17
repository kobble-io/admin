import { MINUTE, SECOND } from '../utils/time';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { AuthConfig } from './auth.internal';
import {
  RawAccessTokenPayloadClaims,
  RawIdTokenPayloadClaims,
  VerifyIdTokenResult,
  VerifyAccessTokenOptions,
  VerifyAccessTokenResult,
  VerifyIdTokenOptions,
} from './auth.types';
import { Cache } from '../utils/cache';
import { Whoami } from '../kobble';
import {
  AccessTokenVerificationError,
  IdTokenVerificationError,
} from './auth.errors';

export class KobbleAuth {
  private static issuer = 'https://kobble.io';
  private projectCache = new Cache<{ projectId: string }>({
    defaultTtl: (50 * MINUTE) / SECOND,
  });

  constructor(private readonly config: AuthConfig) {}

  async getProjectId(): Promise<string> {
    const cachedProject = this.projectCache.get('default');

    if (cachedProject) {
      return cachedProject.projectId;
    }

    const { projectId } =
      await this.config.http.getJson<Whoami>('/auth/whoami');

    this.projectCache.set('projectId', {
      projectId: '',
    });

    return projectId;
  }

  /** Verify an Access Token generated by your OAuth Application or throw an error.
   *  This method will verify the token signature and expiration time.
   *  It will also verify the issuer.
   *  By default, it will accept any audience (any OAuth application of your Kobble project).
   *  If you want to restrict the audience, you can pass the applicationId in the options.
   *
   * @param tokenString The access token string to verify.
   * @param options Example: { applicationId: 'your-application-id' }
   * @returns The verified access token claims with the userId and projectId.
   *
   * @throws {AccessTokenVerificationError} If the token is invalid.
   */
  async verifyAccessToken(
    tokenString: string,
    options: VerifyAccessTokenOptions = {},
  ): Promise<VerifyAccessTokenResult> {
    try {
      const projectId = await this.getProjectId();

      const jwks = createRemoteJWKSet(
        new URL(`/discovery/p/${projectId}/apps/keys`, this.config.baseUrl),
        {
          cacheMaxAge: 15 * MINUTE,
        },
      );

      const result = await jwtVerify<RawAccessTokenPayloadClaims>(
        tokenString,
        jwks,
        {
          audience: options?.applicationId,
          issuer: KobbleAuth.issuer,
          requiredClaims: ['iat', 'exp', 'iss', 'aud', 'sub'],
        },
      );

      return {
        projectId: result.payload.project_id,
        userId: result.payload.sub,
        claims: result.payload,
      };
    } catch (e) {
      throw new AccessTokenVerificationError(e);
    }
  }

  /** Verify an ID Token generated by your OAuth Application or throw an error.
   *  This method will verify the token signature and expiration time.
   *  It will also verify the issuer.
   *  By default, it will accept any audience (any OAuth application of your Kobble project).
   *  If you want to restrict the audience, you can pass the applicationId in the options.
   *
   * @param tokenString The access token string to verify.
   * @param options Example: { applicationId: 'your-application-id' }
   * @returns The verified ID Token claims with the user profile.
   *
   * @throws {IdTokenVerificationError} If the token is invalid.
   */
  async verifyIdToken(
    tokenString: string,
    options: VerifyIdTokenOptions = {},
  ): Promise<VerifyIdTokenResult> {
    try {
      const projectId = await this.getProjectId();

      const jwks = createRemoteJWKSet(
        new URL(`/discovery/p/${projectId}/apps/keys`, this.config.baseUrl),
        {
          cacheMaxAge: 15 * MINUTE,
        },
      );

      const result = await jwtVerify<RawIdTokenPayloadClaims>(
        tokenString,
        jwks,
        {
          audience: options?.applicationId,
          issuer: KobbleAuth.issuer,
          requiredClaims: ['iat', 'exp', 'iss', 'aud', 'sub'],
        },
      );

      return {
        userId: result.payload.sub,
        user: {
          id: result.payload.id,
          email: result.payload.email,
          name: result.payload.name,
          pictureUrl: result.payload.picture_url,
          isVerified: result.payload.is_verified,
          stripeId: result.payload.stripe_id,
          updatedAt: new Date(result.payload.updated_at),
          createdAt: new Date(result.payload.created_at),
        },
        claims: result.payload,
      };
    } catch (e) {
      throw new IdTokenVerificationError(e);
    }
  }
}