import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class UrlzipStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table for storing shortened URLs
    const urlTable = new dynamodb.Table(this, 'UrlTable', {
      tableName: 'urlzip-urls',
      partitionKey: { name: 'shortCode', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to RETAIN for production
    });

    // Base URL will be set after API Gateway is created
    // We'll update this after API creation

    // Lambda function to shorten URLs
    const shortenFunction = new NodejsFunction(this, 'ShortenFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'lambda/shorten/index.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: urlTable.tableName,
      },
      depsLockFilePath: 'lambda/shorten/package-lock.json',
      bundling: {
        nodeModules: ['uuid'],
        minify: true,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // Lambda function to redirect to original URL
    const redirectFunction = new NodejsFunction(this, 'RedirectFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'lambda/redirect/index.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: urlTable.tableName,
      },
      bundling: {
        minify: true,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // Lambda function to generate QR codes
    const qrCodeFunction = new NodejsFunction(this, 'QrCodeFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'lambda/qrcode/index.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: urlTable.tableName,
      },
      depsLockFilePath: 'lambda/qrcode/package-lock.json',
      bundling: {
        nodeModules: ['qrcode'],
        minify: true,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // Grant DynamoDB permissions to Lambda functions
    urlTable.grantReadWriteData(shortenFunction);
    urlTable.grantReadWriteData(redirectFunction);
    urlTable.grantReadData(qrCodeFunction);

    // API Gateway REST API
    const api = new apigateway.RestApi(this, 'UrlzipApi', {
      restApiName: 'URL Shortener Service',
      description: 'Serverless URL shortener API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
      deployOptions: {
        stageName: 'prod',
      },
    });

    // Get base URL from API Gateway and update Lambda environment variables
    const apiBaseUrl = cdk.Fn.join('', [
      'https://',
      api.restApiId,
      '.execute-api.',
      this.region,
      '.amazonaws.com',
    ]);
    shortenFunction.addEnvironment('BASE_URL', apiBaseUrl);
    qrCodeFunction.addEnvironment('BASE_URL', apiBaseUrl);

    // API Gateway Integrations
    const shortenIntegration = new apigateway.LambdaIntegration(shortenFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    const redirectIntegration = new apigateway.LambdaIntegration(redirectFunction);
    const qrCodeIntegration = new apigateway.LambdaIntegration(qrCodeFunction);

    // API Routes
    // POST /shorten - Create shortened URL
    const shortenResource = api.root.addResource('shorten');
    shortenResource.addMethod('POST', shortenIntegration);
    // OPTIONS method is automatically added by defaultCorsPreflightOptions

    // GET /{shortCode} - Redirect to original URL
    const shortCodeResource = api.root.addResource('{shortCode}');
    shortCodeResource.addMethod('GET', redirectIntegration);

    // GET /{shortCode}/qr - Generate QR code
    const qrResource = shortCodeResource.addResource('qr');
    qrResource.addMethod('GET', qrCodeIntegration);
    // OPTIONS method is automatically added by defaultCorsPreflightOptions

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: urlTable.tableName,
      description: 'DynamoDB Table Name',
    });
  }
}
