import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';

interface SearchRequest {
  chainId: number;
  query: string;
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { chainId, query, limit = 10 } = body;

    // Validate input
    if (!chainId || !query) {
      return NextResponse.json(
        { error: 'Missing required parameters: chainId and query' },
        { status: 400 }
      );
    }

    // Use generic MCP client to call search_tokens tool
    const result = await mcpClient.callTool({
      name: 'search_tokens',
      arguments: {
        chainId,
        query,
        limit
      }
    });

    // Parse the response
    const responseText = result.content[0]?.text;
    const response = responseText ? JSON.parse(responseText) : { tokens: [] };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error searching tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 