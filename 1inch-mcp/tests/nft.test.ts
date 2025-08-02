import { NFTService } from '../src/services/nft/NFTService';
import { ServiceConfig } from '../src/services/base/BaseService';
import { describe, it, beforeEach, expect, jest } from '@jest/globals';

describe('NFTService', () => {
  let nftService: NFTService;
  let mockConfig: ServiceConfig;

  beforeEach(() => {
    mockConfig = {
      apiKey: 'test-api-key',
      baseUrl: 'https://api.1inch.dev',
      timeout: 10000
    };
    nftService = new NFTService(mockConfig);
  });

  describe('getSupportedChains', () => {
    it('should return supported chains', async () => {
      const mockResponse = [1, 137, 8453, 42161, 8217, 43114, 10];
      
      // Mock the makeRequest method
      jest.spyOn(nftService as any, 'makeRequest').mockResolvedValue(mockResponse);

      const result = await nftService.getSupportedChains({});
      
      expect(result).toEqual({ chains: mockResponse });
      expect(nftService['makeRequest']).toHaveBeenCalledWith(
        'https://api.1inch.dev/nft/v2/supportedchains'
      );
    });
  });

  describe('getNftsByAddress', () => {
    it('should return NFTs for an address across multiple chains', async () => {
      const mockResponse = {
        assets: [
          {
            id: '1',
            token_id: '123',
            provider: 'OPENSEA' as const,
            name: 'Test NFT',
            chainId: 1,
            priority: 1,
            asset_contract: {
              address: '0x1234567890123456789012345678901234567890',
              schema_name: 'ERC721',
              image_url: 'https://example.com/image.png'
            }
          }
        ],
        openseaNextToken: 'next-token'
      };

      jest.spyOn(nftService as any, 'makeRequest').mockResolvedValue(mockResponse);

      const params = {
        chainIds: [1, 137],
        address: '0x1234567890123456789012345678901234567890',
        limit: 20,
        offset: 0
      };

      const result = await nftService.getNftsByAddress(params);

      expect(result).toEqual(mockResponse);
      expect(nftService['makeRequest']).toHaveBeenCalledWith(
        'https://api.1inch.dev/nft/v2/byaddress?chainIds=1%2C137&address=0x1234567890123456789012345678901234567890&limit=20&offset=0'
      );
    });

    it('should handle optional parameters correctly', async () => {
      const mockResponse = {
        assets: [],
        openseaNextToken: null
      };

      jest.spyOn(nftService as any, 'makeRequest').mockResolvedValue(mockResponse);

      const params = {
        chainIds: [1],
        address: '0x1234567890123456789012345678901234567890',
        openseaNextToken: 'prev-token'
      };

      await nftService.getNftsByAddress(params);

      expect(nftService['makeRequest']).toHaveBeenCalledWith(
        'https://api.1inch.dev/nft/v2/byaddress?chainIds=1&address=0x1234567890123456789012345678901234567890&openseaNextToken=prev-token'
      );
    });

    it('should handle 404 errors gracefully', async () => {
      const error = new Error('Not Found');
      (error as any).response = { status: 404 };
      
      jest.spyOn(nftService as any, 'makeRequest').mockRejectedValue(error);

      const params = {
        chainIds: [1],
        address: '0x1234567890123456789012345678901234567890'
      };

      await expect(nftService.getNftsByAddress(params)).rejects.toThrow(
        'NFT API endpoints are not available in the current API subscription. Please check your 1inch API plan.'
      );
    });
  });

  describe('getNftById', () => {
    it('should return detailed NFT information', async () => {
      const mockResponse = {
        id: '1',
        token_id: '123',
        name: 'Test NFT',
        image_url: { original: 'https://example.com/image.png' },
        chainId: 1,
        provider: 'OPENSEA',
        description: 'A test NFT',
        permalink: 'https://opensea.io/collection/test',
        collection: {
          image_url: 'https://example.com/collection.png',
          name: 'Test Collection',
          description: 'A test collection',
          creator: {
            profile_img_url: 'https://example.com/creator.png',
            address: '0x1234567890123456789012345678901234567890'
          },
          user: {
            username: 'testuser'
          }
        },
        traits: [
          { value: 'Rare' }
        ],
        asset_contract: {
          address: '0x1234567890123456789012345678901234567890',
          schema_name: 'ERC721',
          image_url: 'https://example.com/contract.png'
        }
      };

      jest.spyOn(nftService as any, 'makeRequest').mockResolvedValue(mockResponse);

      const params = {
        chainId: 1,
        contract: '0x1234567890123456789012345678901234567890',
        id: '123',
        provider: 'OPENSEA'
      };

      const result = await nftService.getNftById(params);

      expect(result).toEqual(mockResponse);
      expect(nftService['makeRequest']).toHaveBeenCalledWith(
        'https://api.1inch.dev/nft/v2/contract?chainId=1&contract=0x1234567890123456789012345678901234567890&id=123&provider=OPENSEA'
      );
    });

    it('should handle 404 errors gracefully', async () => {
      const error = new Error('Not Found');
      (error as any).response = { status: 404 };
      
      jest.spyOn(nftService as any, 'makeRequest').mockRejectedValue(error);

      const params = {
        chainId: 1,
        contract: '0x1234567890123456789012345678901234567890',
        id: '123',
        provider: 'OPENSEA'
      };

      await expect(nftService.getNftById(params)).rejects.toThrow(
        'NFT API endpoints are not available in the current API subscription. Please check your 1inch API plan.'
      );
    });
  });

  describe('Tool Definitions', () => {
    it('should return correct tool definitions', () => {
      const tools = nftService.getTools();
      
      expect(tools).toHaveLength(3);
      
      const supportedChainsTool = tools.find(t => t.name === 'get_supported_chains');
      expect(supportedChainsTool).toBeDefined();
      expect(supportedChainsTool?.inputSchema.properties).toEqual({});
      
      const getNftsTool = tools.find(t => t.name === 'get_nfts_by_address');
      expect(getNftsTool).toBeDefined();
      expect(getNftsTool?.inputSchema.properties.chainIds).toBeDefined();
      expect(getNftsTool?.inputSchema.properties.address).toBeDefined();
      
      const getNftByIdTool = tools.find(t => t.name === 'get_nft_by_id');
      expect(getNftByIdTool).toBeDefined();
      expect(getNftByIdTool?.inputSchema.properties.chainId).toBeDefined();
      expect(getNftByIdTool?.inputSchema.properties.contract).toBeDefined();
      expect(getNftByIdTool?.inputSchema.properties.id).toBeDefined();
      expect(getNftByIdTool?.inputSchema.properties.provider).toBeDefined();
    });
  });

  describe('Resource Definitions', () => {
    it('should return correct resource definitions', () => {
      const resources = nftService.getResources();
      
      expect(resources).toHaveLength(2);
      
      const documentationResource = resources.find(r => r.uri === '1inch://nft/documentation');
      expect(documentationResource).toBeDefined();
      
      const chainsResource = resources.find(r => r.uri === '1inch://nft/supported-chains');
      expect(chainsResource).toBeDefined();
    });
  });

  describe('Prompt Definitions', () => {
    it('should return correct prompt definitions', () => {
      const prompts = nftService.getPrompts();
      
      expect(prompts).toHaveLength(1);
      
      const analyzePrompt = prompts.find(p => p.name === 'analyze_wallet_nfts');
      expect(analyzePrompt).toBeDefined();
      expect(analyzePrompt?.arguments).toHaveLength(3);
    });
  });
}); 