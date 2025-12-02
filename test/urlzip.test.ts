import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { UrlzipStack } from '../lib/urlzip-stack';

test('Stack Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new UrlzipStack(app, 'TestStack', {
    env: { account: '123456789012', region: 'us-east-1' },
  });
  // THEN
  const template = Template.fromStack(stack);

  // Verify DynamoDB table exists
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    TableName: 'urlzip-urls',
  });

  // Verify API Gateway exists
  template.hasResourceProperties('AWS::ApiGateway::RestApi', {
    Name: 'URL Shortener Service',
  });
});
