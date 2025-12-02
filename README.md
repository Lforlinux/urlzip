# URLZip - Serverless URL Shortener

A fully serverless URL shortener service built with AWS CDK, Lambda, DynamoDB, and API Gateway. Features include URL shortening, QR code generation, and click tracking.

## Architecture

- **AWS Lambda**: Three functions for shortening, redirecting, and QR code generation
- **DynamoDB**: Stores shortened URLs with TTL support
- **API Gateway**: REST API for all endpoints
- **CDK**: Infrastructure as Code
- **TypeScript**: Full TypeScript support

## Features

- ✅ Shorten URLs with custom aliases
- ✅ Redirect to original URLs
- ✅ Generate QR codes on-the-fly
- ✅ Click tracking
- ✅ TTL support (1 year default)
- ✅ CORS enabled
- ✅ Fully serverless

## Prerequisites

- Node.js 20.x or higher
- AWS CLI configured
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- AWS Account ID: 168379940880
- Region: us-east-1

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Lambda dependencies:
```bash
cd lambda/shorten && npm install && cd ../..
cd lambda/redirect && npm install && cd ../..
cd lambda/qrcode && npm install && cd ../..
```

3. Bootstrap CDK (first time only):
```bash
cdk bootstrap aws://168379940880/us-east-1
```

4. Deploy:
```bash
cdk deploy
```

## API Endpoints

After deployment, you'll get an API Gateway URL. Use these endpoints:

### Shorten URL
```bash
POST /shorten
Content-Type: application/json

{
  "url": "https://example.com",
  "customAlias": "optional-alias"
}
```

### Redirect
```bash
GET /{shortCode}
```

### Generate QR Code
```bash
GET /{shortCode}/qr
```

## CI/CD

The project includes GitHub Actions workflow for:
- Automated testing
- SonarCloud code analysis
- AWS deployment

### Required GitHub Secrets:
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `SONAR_TOKEN`: SonarCloud token

## SonarCloud Setup

1. Create a project on SonarCloud
2. Get your organization key and project key
3. Update `sonar-project.properties` with your keys
4. Add `SONAR_TOKEN` to GitHub Secrets

## Development & Testing

```bash
# Build
npm run build

# Watch mode
npm run watch

# Unit tests
npm test

# CDK commands
cdk synth    # Synthesize CloudFormation template
cdk diff     # Compare deployed stack with current state
cdk deploy   # Deploy this stack to your default AWS account/region
```

## Testing

All testing is done on AWS after deployment:

1. **Deploy the stack**: `cdk deploy`
2. **Get the API URL** from the CDK output
3. **Test the endpoints** using curl or Postman:

```bash
# Shorten a URL
curl -X POST https://YOUR_API_URL/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Test redirect (in browser or curl)
curl -L https://YOUR_API_URL/{shortCode}

# Get QR code
curl https://YOUR_API_URL/{shortCode}/qr --output qr.png
```

## Project Structure

```
urlzip/
├── bin/
│   └── urlzip.ts          # CDK app entry point
├── lib/
│   └── urlzip-stack.ts    # Main CDK stack definition
├── lambda/
│   ├── shorten/           # URL shortening Lambda
│   ├── redirect/          # URL redirect Lambda
│   └── qrcode/            # QR code generation Lambda
├── test/                  # Unit tests
└── cdk.json               # CDK configuration
```

## License

MIT
