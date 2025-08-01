// Domain API Types for 1inch Domains Service

// GET /domains/address/{address}/
export interface GetDomainsByAddressRequest {
  address: string;
}

export interface DomainInfo {
  domain: string;
  provider: string;
  address: string;
}

export type GetDomainsByAddressResponse = DomainInfo[];

// GET /domains/address/{address}/primary/
export interface GetPrimaryDomainRequest {
  address: string;
}

export type GetPrimaryDomainResponse = DomainInfo;

// POST /domains/address/batch/
export interface BatchResolveDomainsRequest {
  addresses: string[];
}

export interface BatchDomainResult {
  address: string;
  domain?: string;
  provider?: string;
}

export type BatchResolveDomainsResponse = BatchDomainResult[];

// GET /domains/providers/
export interface DomainProvider {
  provider: string;
  avatar?: string;
  description?: string;
}

export type GetDomainProvidersResponse = DomainProvider[]; 