import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.TABLE_NAME!;
const BASE_URL = process.env.BASE_URL || 'https://your-domain.com';

interface ShortenRequest {
  url: string;
  customAlias?: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body: ShortenRequest = JSON.parse(event.body);
    const { url, customAlias } = body;

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid URL format' }),
      };
    }

    // Generate short code
    let shortCode: string;
    if (customAlias) {
      shortCode = customAlias;
      // Check if alias already exists
      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { shortCode },
        })
      );
      if (existing.Item) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'Custom alias already exists' }),
        };
      }
    } else {
      // Generate random 6-character code
      shortCode = randomBytes(3).toString('base64url').substring(0, 6);
    }

    const shortUrl = `${BASE_URL}/${shortCode}`;
    const createdAt = new Date().toISOString();

    // Save to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          shortCode,
          originalUrl: url,
          shortUrl,
          createdAt,
          clicks: 0,
          ttl: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year TTL
        },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        shortCode,
        shortUrl,
        originalUrl: url,
        createdAt,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

