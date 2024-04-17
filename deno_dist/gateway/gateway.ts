import { createPublicKey } from 'node:crypto';
import { KeyInfo, ParseTokenOptions, TokenPayload } from './gateway.types.ts';
import type { GatewayConfig, RawTokenPayload } from './gateway.internal.ts';
import { Cache } from '../utils/cache.ts';
import { MINUTE, SECOND } from '../utils/time.ts';
import { verifyJwt } from '../utils/jwt.ts';

export class KobbleGateway {
  private static issuer = 'gateway.kobble.io';
  private keyCache = new Cache<KeyInfo>({ defaultTtl: (15 * MINUTE) / SECOND });

  private async fetchKeyInfo(): Promise<KeyInfo> {
    const { pem, projectId } = await this.config.http.getJson<{
      pem: string;
      projectId: string;
    }>('/gateway/getPublicKey');
    const key = createPublicKey({
      key: pem,
      format: 'pem',
      type: 'spki',
    });

    return {
      key,
      projectId,
    };
  }

  private async getKeyInfo(): Promise<KeyInfo> {
    const info = this.keyCache.get('default');

    if (info) {
      return info;
    }

    const data = await this.fetchKeyInfo();

    this.keyCache.set('default', data);

    return data;
  }

  constructor(private readonly config: GatewayConfig) {}

  /**
   * Verify and parse the payload of a Kobble gateway token.
   * This kind of token is sent to your backend on each request that is handled by your Kobble project.
   *
   * By default, this function will verify that:
   * - The required claims are present
   * - The 'aud' claim matches the current project ID
   * - The 'iss' claim matches the issuer used by Kobble to forge such tokens
   * - The token is not expired
   * - The signature is valid (i.e that this token has not been tampered with and is intended for your project)
   *
   * Although it is not recommended, some of these verifications can be skipped by passing special options.
   */
  async parseToken(
    tokenString: string,
    options: ParseTokenOptions = {},
  ): Promise<TokenPayload> {
    const { key, projectId } = await this.getKeyInfo();
    const payload = verifyJwt<RawTokenPayload>(tokenString, key, {
      requiredClaims: ['iat', 'exp', 'iss', 'aud', 'sub', 'user'],
      audience: projectId,
      iss: KobbleGateway.issuer,
      verifySignature: options.verifySignature,
      verifyAud: options.verifyAud,
      verifyExp: options.verifyExp,
      verifyIss: options.verifyIss,
    });

    return {
      projectId: payload.aud,
      user: payload.user,
    };
  }
}
