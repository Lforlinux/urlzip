#!/bin/bash

# Install dependencies for all Lambda functions

echo "Installing dependencies for Lambda functions..."

cd lambda/shorten
npm install
cd ../..

cd lambda/redirect
npm install
cd ../..

cd lambda/qrcode
npm install
cd ../..

echo "All Lambda dependencies installed!"

