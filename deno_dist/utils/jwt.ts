import { Buffer } from "node:buffer";
import { KeyObject, verify } from 'node:crypto';

export type VerifyJwtOptions = {
  verifyAud?: boolean;
  verifyExp?: boolean;
  verifySignature?: boolean;
  verifyIss?: boolean;
  iss?: string;
  audience?: string;
  requiredClaims?: string[];
};

export class VerifyJwtError extends Error {}

const verifyES256Signature = (
  data: Buffer,
  signature: Buffer,
  key: KeyObject,
) => {
  return verify('sha256', data, { dsaEncoding: 'ieee-p1363', key }, signature);
};

/**
 * Verify a JWT signed with ES256.
 */
export const verifyJwt = <T = Record<string, unknown>>(
  tokenString: string,
  key: KeyObject,
  options: VerifyJwtOptions = {},
): T => {
  const {
    verifyIss = true,
    iss,
    verifyExp = true,
    verifySignature = true,
    verifyAud = true,
    requiredClaims,
    audience,
  } = options;
  const ss = tokenString.split('.');

  if (ss.length != 3) {
    throw new VerifyJwtError(
      `Expected three dot separated segments but found ${ss.length}. Did you pass a valid JWT?`,
    );
  }

  const [encodedHeader, encodedPayload, encodedSignature] = ss;
  const payload = JSON.parse(
    Buffer.from(encodedPayload, 'base64url').toString(),
  );

  if (requiredClaims) {
    const missing: string[] = [];

    for (const claim of requiredClaims) {
      if (typeof payload[claim] === 'undefined') {
        missing.push(claim);
      }
    }

    if (missing.length > 0) {
      throw new VerifyJwtError(
        `The following required claims are missing from the token payload: ${missing.join(',')}`,
      );
    }
  }

  if (verifyExp) {
    const now = new Date();
    const expiresAt = new Date(payload.exp * 1000);

    if (now > expiresAt) {
      throw new VerifyJwtError(
        `This token expired on the ${expiresAt} which is BEFORE the current datetime ${now}.`,
      );
    }
  }

  if (verifyAud && audience && payload.aud !== audience) {
    throw new VerifyJwtError(
      `Invalid audience: expected ${audience} but got ${payload.aud}.`,
    );
  }

  if (verifyIss && iss && payload.iss !== iss) {
    throw new VerifyJwtError(
      `Invalid issuer: expected ${iss} but got ${payload.iss}.`,
    );
  }

  if (verifySignature) {
    const data = Buffer.from(`${encodedHeader}.${encodedPayload}`);
    const signature = Buffer.from(encodedSignature, 'base64url');
    const isValid = verifyES256Signature(data, signature, key);

    if (!isValid) {
      throw new VerifyJwtError('Invalid signature.');
    }
  }

  return payload;
};
