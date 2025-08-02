export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, conversationId } = body;

    if(!message) {
      return Response.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    // Make request to chat server
    const response = await fetch('http://localhost:3939/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat server responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    console.error('Error calling chat server:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
