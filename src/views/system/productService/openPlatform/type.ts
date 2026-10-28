export interface OpenPlatformApiKeyItem {
  id: number;
  name: string;
  keyId: string;
  apiKeyMasked?: string;
  status: number;
  rateLimitQps?: number;
  rateLimitDay?: number;
  rateLimitDayCcdb?: number;
  expireAt?: string | null;
  lastUsedAt?: string | null;
  totalCall?: number;
  dayCallUsed?: number;
  dayCallUsedCcdb?: number;
  createTime?: string;
}

export interface CreateApiKeyReq {
  name: string;
  remark: string;
}

export interface ApiKeySecretData {
  id: number;
  keyId: string;
  apiKey: string;
  name: string;
}
