import { KeyObject } from 'node:crypto';

export type ParseTokenOptions = {
  verifyIss?: boolean;
  verifyAud?: boolean;
  verifyExp?: boolean;
  verifySignature?: boolean;
};

export type TokenProductQuota = {
  id: string;
  name: string;
  used: number;
  limit: number;
};

export type TokenProduct = {
  id: string;
  quotas: TokenProductQuota[];
};

export type TokenPayload = {
  projectId: string;
  user: {
    email: string;
    id: string;
    name: string | null;
    products: TokenProduct[];
  };
};

export type KeyInfo = {
  key: KeyObject;
  projectId: string;
};
