import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp-client';

export async function GET(request: NextRequest) {
  try {
    // Use generic MCP client to check health
    const healthResult = await mcpClient.healthCheck();

    return NextResponse.json(healthResult);
  } catch (error) {
    console.error('Error checking health:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        services: { 'mcp-server': { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' } },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 