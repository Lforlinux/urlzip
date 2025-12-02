# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install Lambda function dependencies
./scripts/setup-lambda-deps.sh
```

### 2. Configure SonarCloud

1. Go to [SonarCloud](https://sonarcloud.io) and create/login to your account
2. Create a new project
3. Get your:
   - Organization key
   - Project key
4. Update `sonar-project.properties`:
   ```properties
   sonar.organization=your-org-key
   sonar.projectKey=urlzip
   ```
5. Generate a token in SonarCloud (My Account > Security > Generate Token)
6. Add to GitHub Secrets as `SONAR_TOKEN`

### 3. Configure GitHub Secrets

Go to your GitHub repository > Settings > Secrets and variables > Actions, and add:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key  
- `SONAR_TOKEN`: Your SonarCloud token

### 4. Bootstrap CDK (First Time Only)

```bash
cdk bootstrap aws://168379940880/us-east-1
```

### 5. Deploy

```bash
cdk deploy
```

After deployment, you'll get the API Gateway URL in the outputs.

## Testing the API

Once deployed, you'll get an API URL like:
`https://xxxxx.execute-api.us-east-1.amazonaws.com/prod`

### Shorten a URL

```bash
curl -X POST https://YOUR_API_URL/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Redirect (in browser)
Visit: `https://YOUR_API_URL/{shortCode}`

### Get QR Code
Visit: `https://YOUR_API_URL/{shortCode}/qr`

## Project Structure

```
urlzip/
├── bin/urlzip.ts              # CDK app entry
├── lib/urlzip-stack.ts        # Infrastructure definition
├── lambda/
│   ├── shorten/               # URL shortening function
│   ├── redirect/              # Redirect function
│   └── qrcode/                # QR code generation
├── .github/workflows/         # CI/CD pipeline
└── sonar-project.properties   # SonarCloud config
```

## Next Steps

1. **Custom Domain**: Add a custom domain to API Gateway for a cleaner URL
2. **Rate Limiting**: Add API Gateway throttling
3. **Authentication**: Add API keys or Cognito for protected endpoints
4. **Analytics**: Add CloudWatch dashboards for metrics
5. **Frontend**: Create a React/Vue frontend to use the API

