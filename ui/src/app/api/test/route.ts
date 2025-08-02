import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';

interface SearchRequest {
  chainId: number;
  query: string;
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, args } : any = body;

    console.log('Received request:', { type, args });

    // Validate input
    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' },
        { status: 400 }
      );
    }

    // Use generic MCP client to call the specified tool
    const result = await mcpClient.callTool({
      name: type,
      arguments: args || {}
    });

    console.log('MCP result:', result);

    // Parse the response - handle different response structures
    let responseText;
    if (result && typeof result === 'object') {
      // Handle different possible response structures
      if ('content' in result && Array.isArray(result.content)) {
        responseText = result.content[0]?.text;
      } else if ('data' in result) {
        responseText = result.data;
      } else if ('response' in result) {
        responseText = result.response;
      } else {
        responseText = JSON.stringify(result);
      }
    }
    
    let response;
    
    try {
      response = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('Error parsing response text:', parseError);
      // Return the raw text if JSON parsing fails
      response = { data: responseText };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in test API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 