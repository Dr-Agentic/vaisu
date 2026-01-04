#!/bin/bash

# AWS Infrastructure Setup Script for Vaisu
# Creates DynamoDB tables and S3 bucket for the application

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up AWS Infrastructure for Vaisu${NC}"
echo ""

# Function to check if AWS CLI is installed and configured
check_aws_cli() {
    echo "Checking AWS CLI..."

    if ! command -v aws &> /dev/null; then
        echo -e "${RED}✗${NC} AWS CLI not found"
        echo "Please install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi

    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}✗${NC} AWS CLI not configured"
        echo "Please configure AWS CLI: aws configure"
        exit 1
    fi

    echo -e "${GREEN}✓${NC} AWS CLI configured"

    # Get account info
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REGION=$(aws configure get region)

    echo -e "${BLUE}Account ID:${NC} $ACCOUNT_ID"
    echo -e "${BLUE}Region:${NC} $REGION"
    echo ""
}

# Function to create S3 bucket
create_s3_bucket() {
    echo "Setting up S3 bucket..."

    BUCKET_NAME="${S3_BUCKET_NAME:-vaisu-documents-$(date +%s)}"
    REGION="${AWS_REGION:-us-east-1}"

    echo -e "${BLUE}Creating bucket:${NC} $BUCKET_NAME"

    # Create bucket
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION" \
        2>/dev/null || {
        # Bucket might already exist
        echo -e "${YELLOW}⚠${NC} Bucket might already exist, checking..."
        if aws s3 ls "s3://$BUCKET_NAME" &> /dev/null; then
            echo -e "${GREEN}✓${NC} Bucket already exists"
        else
            echo -e "${RED}✗${NC} Failed to create bucket"
            exit 1
        fi
    }

    # Set bucket policy to allow public read (optional, for development)
    cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF

    aws s3api put-bucket-policy \
        --bucket "$BUCKET_NAME" \
        --policy file:///tmp/bucket-policy.json \
        2>/dev/null || echo -e "${YELLOW}⚠${NC} Could not set bucket policy (this is optional)"

    echo -e "${GREEN}✓${NC} S3 bucket created: $BUCKET_NAME"
    echo ""

    # Store bucket name for environment setup
    echo "export S3_BUCKET_NAME=$BUCKET_NAME" > /tmp/aws-exports.env
}

# Function to create DynamoDB tables
create_dynamodb_tables() {
    echo "Setting up DynamoDB tables..."

    REGION="${AWS_REGION:-us-east-1}"

    # Table definitions
    TABLES=(
        "vaisu-documents"
        "vaisu-analyses"
        "vaisu-visualizations"
    )

    for table_name in "${TABLES[@]}"; do
        echo -e "${BLUE}Creating table:${NC} $table_name"

        # Check if table exists
        if aws dynamodb describe-table --table-name "$table_name" --region "$REGION" &> /dev/null; then
            echo -e "${YELLOW}⚠${NC} Table $table_name already exists"
            continue
        fi

        # Create table based on type
        case "$table_name" in
            "vaisu-documents")
                aws dynamodb create-table \
                    --table-name "$table_name" \
                    --attribute-definitions \
                        AttributeName=documentId,AttributeType=S \
                        AttributeName=userId,AttributeType=S \
                        AttributeName=filename,AttributeType=S \
                        AttributeName=contentHash,AttributeType=S \
                        AttributeName=uploadedAt,AttributeType=S \
                    --key-schema \
                        AttributeName=documentId,KeyType=HASH \
                    --global-secondary-indexes \
                        '[{
                            "IndexName": "user-documents-index",
                            "KeySchema": [{"AttributeName": "userId", "KeyType": "HASH"}, {"AttributeName": "uploadedAt", "KeyType": "RANGE"}],
                            "Projection": {"ProjectionType": "ALL"},
                            "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
                        },
                        {
                            "IndexName": "hash-filename-index",
                            "KeySchema": [{"AttributeName": "contentHash", "KeyType": "HASH"}, {"AttributeName": "filename", "KeyType": "RANGE"}],
                            "Projection": {"ProjectionType": "ALL"},
                            "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
                        }]' \
                    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
                    --region "$REGION"
                ;;
            "vaisu-analyses")
                aws dynamodb create-table \
                    --table-name "$table_name" \
                    --attribute-definitions \
                        AttributeName=documentId,AttributeType=S \
                        AttributeName=createdAt,AttributeType=S \
                    --key-schema \
                        AttributeName=documentId,KeyType=HASH \
                        AttributeName=createdAt,KeyType=RANGE \
                    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
                    --region "$REGION"
                ;;
            "vaisu-visualizations")
                aws dynamodb create-table \
                    --table-name "$table_name" \
                    --attribute-definitions \
                        AttributeName=documentId,AttributeType=S \
                        AttributeName=SK,AttributeType=S \
                    --key-schema \
                        AttributeName=documentId,KeyType=HASH \
                        AttributeName=SK,KeyType=RANGE \
                    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
                    --region "$REGION"
                ;;
        esac

        # Wait for table to be active
        echo -n "Waiting for table to be active..."
        aws dynamodb wait table-exists --table-name "$table_name" --region "$REGION"
        echo " ✓"

        echo -e "${GREEN}✓${NC} Table $table_name created"
    done

    echo ""

    # Add table names to environment file
    echo "export DYNAMODB_DOCUMENTS_TABLE=vaisu-documents" >> /tmp/aws-exports.env
    echo "export DYNAMODB_ANALYSES_TABLE=vaisu-analyses" >> /tmp/aws-exports.env
    echo "export DYNAMODB_VISUALIZATIONS_TABLE=vaisu-visualizations" >> /tmp/aws-exports.env
}

# Function to create .env file
create_env_file() {
    echo "Creating environment configuration..."

    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            echo -e "${GREEN}✓${NC} Created backend/.env from example"
        else
            echo -e "${YELLOW}⚠${NC} No .env.example found, creating basic .env"
            cat > backend/.env << EOF
# AWS Configuration
AWS_REGION=us-east-1

# S3 Configuration
S3_BUCKET_NAME=vaisu-documents-dev

# DynamoDB Configuration
DYNAMODB_DOCUMENTS_TABLE=vaisu-documents
DYNAMODB_ANALYSES_TABLE=vaisu-analyses
DYNAMODB_VISUALIZATIONS_TABLE=vaisu-visualizations

# LLM Configuration
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Application Configuration
PORT=3001
NODE_ENV=development
EOF
        fi
    fi

    # Update .env with actual values
    if [ -f /tmp/aws-exports.env ]; then
        while IFS= read -r line; do
            if [[ $line == export* ]]; then
                key_value="${line#export }"
                key="${key_value%%=*}"
                value="${key_value#*=}"

                # Update existing value or add new line
                if grep -q "^${key}=" backend/.env; then
                    sed -i.bak "s/^${key}=.*/${key}=${value}/" backend/.env
                else
                    echo "$key=$value" >> backend/.env
                fi
            fi
        done < /tmp/aws-exports.env

        # Clean up backup file
        rm -f backend/.env.bak
    fi

    echo -e "${GREEN}✓${NC} Environment file updated"
    echo ""
}

# Function to show usage instructions
show_instructions() {
    echo -e "${BLUE}📋 Setup Complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Set your OpenRouter API key in backend/.env:"
    echo "   OPENROUTER_API_KEY=sk-or-..."
    echo ""
    echo "2. Install dependencies (if not already done):"
    echo "   npm install"
    echo ""
    echo "3. Start the application:"
    echo "   npm run dev"
    echo ""
    echo "4. Test the infrastructure:"
    echo "   - Upload a document at http://localhost:5173"
    echo "   - Generate visualizations including argument maps"
    echo ""
    echo "Environment variables set:"
    grep "^S3_BUCKET_NAME\|^DYNAMODB_" backend/.env | while read line; do
        echo "   $line"
    done
    echo ""
    echo -e "${GREEN}✅ AWS Infrastructure is ready!${NC}"
}

# Main execution
main() {
    # Check if AWS CLI is available and configured
    check_aws_cli

    # Create S3 bucket
    create_s3_bucket

    # Create DynamoDB tables
    create_dynamodb_tables

    # Create/update environment file
    create_env_file

    # Show instructions
    show_instructions
}

# Run main function
main