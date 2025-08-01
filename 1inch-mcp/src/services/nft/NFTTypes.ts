// NFT API Request Types
export interface SupportedChainsRequest {
  // No parameters needed for this endpoint
}

export interface GetNftsByAddressRequest {
  chainIds: number[];
  address: string;
  limit?: number;
  offset?: number;
  openseaNextToken?: string;
}

export interface GetNftByIdRequest {
  chainId: number;
  contract: string;
  id: string;
  provider: string;
}

// NFT API Response Types
export interface SupportedChainsResponse {
  chains: number[];
}

export interface AssetContract {
  address: string;
  schema_name: string;
  image_url: string;
}

export interface NftV2Model {
  id: string;
  token_id: string;
  provider: 'OPENSEA' | 'RARIBLE' | 'POAP';
  name: string;
  chainId: number;
  priority: number;
  asset_contract: AssetContract;
}

export interface AssetsResponse {
  assets: NftV2Model[];
  openseaNextToken: string;
}

export interface Creator {
  profile_img_url: string;
  address: string;
}

export interface User {
  username: string;
}

export interface Collection {
  image_url: string;
  name: string;
  description: string;
  creator: Creator;
  user: User;
}

export interface Traits {
  value: string;
}

export interface SingleNft {
  id: string;
  token_id: string;
  name: string;
  image_url: object;
  chainId: number;
  provider: string;
  description: string;
  permalink: string;
  collection: Collection;
  traits: Traits[];
  asset_contract: AssetContract;
} 