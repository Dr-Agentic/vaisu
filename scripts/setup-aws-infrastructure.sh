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

# Determine project root and paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
BACKEND_ENV="$BACKEND_DIR/.env"

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

    # Check if bucket exists
    if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
        echo -e "${YELLOW}⚠${NC} Bucket $BUCKET_NAME already exists"
    else
        echo -e "${BLUE}Creating bucket:${NC} $BUCKET_NAME"

        # Create bucket
        if [ "$REGION" = "us-east-1" ]; then
            aws s3api create-bucket \
                --bucket "$BUCKET_NAME" \
                --region "$REGION" \
                || {
                    echo -e "${RED}✗${NC} Failed to create bucket"
                    exit 1
                }
        else
            aws s3api create-bucket \
                --bucket "$BUCKET_NAME" \
                --region "$REGION" \
                --create-bucket-configuration LocationConstraint="$REGION" \
                || {
                    echo -e "${RED}✗${NC} Failed to create bucket"
                    exit 1
                }
        fi

        echo -e "${GREEN}✓${NC} S3 bucket created: $BUCKET_NAME"
    fi
    echo ""

    # Ensure bucket is private by blocking public access
    echo "Ensuring bucket is private..."
    aws s3api put-public-access-block \
        --bucket "$BUCKET_NAME" \
        --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
        || echo -e "${YELLOW}⚠${NC} Could not set public access block"

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
        "vaisu-argument-map"
        "vaisu-depth-graph"
        "vaisu-uml-class"
        "vaisu-mind-map"
        "vaisu-flowchart"
        "vaisu-executive-dashboard"
        "vaisu-timeline"
        "vaisu-terms-definitions"
        "vaisu-knowledge-graph"
    )

    for table_name in "${TABLES[@]}"; do
        echo -e "${BLUE}Creating table:${NC} $table_name"

        # Check if table exists
        if aws dynamodb describe-table --table-name "$table_name" --region "$REGION" &> /dev/null; then
            echo -e "${YELLOW}⚠${NC} Table $table_name already exists"

            # Check and enforce On-Demand billing
            CURRENT_MODE=$(aws dynamodb describe-table --table-name "$table_name" --region "$REGION" --query 'Table.BillingModeSummary.BillingMode' --output text 2>/dev/null)
            
            if [ "$CURRENT_MODE" != "PAY_PER_REQUEST" ]; then
                echo "Updating to On-Demand (PAY_PER_REQUEST)..."
                aws dynamodb update-table \
                    --table-name "$table_name" \
                    --billing-mode PAY_PER_REQUEST \
                    --region "$REGION" > /dev/null
                echo -e "${GREEN}✓${NC} Update triggered: switched to On-Demand"
            fi
            continue
        fi

        # Create table based on type
        case "$table_name" in
            "vaisu-documents")
                aws dynamodb create-table \
                    --table-name "$table_name" \
                    --attribute-definitions \
                        AttributeName=documentId,AttributeType=S \
                        AttributeName=SK,AttributeType=S \
                        AttributeName=contentHash,AttributeType=S \
                        AttributeName=filename,AttributeType=S \
                    --key-schema \
                        AttributeName=documentId,KeyType=HASH \
                        AttributeName=SK,KeyType=RANGE \
                    --global-secondary-indexes \
                        '[{
                            "IndexName": "GSI1",
                            "KeySchema": [
                                {"AttributeName": "contentHash", "KeyType": "HASH"},
                                {"AttributeName": "filename", "KeyType": "RANGE"}
                            ],
                            "Projection": {"ProjectionType": "ALL"}
                        }]' \
                    --billing-mode PAY_PER_REQUEST \
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
                    --billing-mode PAY_PER_REQUEST \
                    --region "$REGION"
                ;;
            *)
                # All other tables (visualizations) use documentId (PK) + SK (SK)
                aws dynamodb create-table \
                    --table-name "$table_name" \
                    --attribute-definitions \
                        AttributeName=documentId,AttributeType=S \
                        AttributeName=SK,AttributeType=S \
                    --key-schema \
                        AttributeName=documentId,KeyType=HASH \
                        AttributeName=SK,KeyType=RANGE \
                    --billing-mode PAY_PER_REQUEST \
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
    echo "export DYNAMODB_ARGUMENT_MAP_TABLE=vaisu-argument-map" >> /tmp/aws-exports.env
    echo "export DYNAMODB_DEPTH_GRAPH_TABLE=vaisu-depth-graph" >> /tmp/aws-exports.env
    echo "export DYNAMODB_UML_CLASS_TABLE=vaisu-uml-class" >> /tmp/aws-exports.env
    echo "export DYNAMODB_MIND_MAP_TABLE=vaisu-mind-map" >> /tmp/aws-exports.env
    echo "export DYNAMODB_FLOWCHART_TABLE=vaisu-flowchart" >> /tmp/aws-exports.env
    echo "export DYNAMODB_EXECUTIVE_DASHBOARD_TABLE=vaisu-executive-dashboard" >> /tmp/aws-exports.env
    echo "export DYNAMODB_TIMELINE_TABLE=vaisu-timeline" >> /tmp/aws-exports.env
    echo "export DYNAMODB_TERMS_DEFINITIONS_TABLE=vaisu-terms-definitions" >> /tmp/aws-exports.env
    echo "export DYNAMODB_KNOWLEDGE_GRAPH_TABLE=vaisu-knowledge-graph" >> /tmp/aws-exports.env
}

# Function to create .env file
create_env_file() {
    echo "Creating environment configuration..."

    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${RED}✗${NC} Backend directory not found at $BACKEND_DIR"
        exit 1
    fi

    if [ ! -f "$BACKEND_ENV" ]; then
        if [ -f "$BACKEND_DIR/.env.example" ]; then
            cp "$BACKEND_DIR/.env.example" "$BACKEND_ENV"
            echo -e "${GREEN}✓${NC} Created backend/.env from example"
        else
            echo -e "${YELLOW}⚠${NC} No .env.example found, creating basic .env"
            cat > "$BACKEND_ENV" << EOF
# AWS Configuration
AWS_REGION=us-east-1

# S3 Configuration
S3_BUCKET_NAME=vaisu-documents-dev

# DynamoDB Configuration
DYNAMODB_DOCUMENTS_TABLE=vaisu-documents
DYNAMODB_ANALYSES_TABLE=vaisu-analyses
DYNAMODB_ARGUMENT_MAP_TABLE=vaisu-argument-map
DYNAMODB_DEPTH_GRAPH_TABLE=vaisu-depth-graph
DYNAMODB_UML_CLASS_TABLE=vaisu-uml-class
DYNAMODB_MIND_MAP_TABLE=vaisu-mind-map
DYNAMODB_FLOWCHART_TABLE=vaisu-flowchart
DYNAMODB_EXECUTIVE_DASHBOARD_TABLE=vaisu-executive-dashboard
DYNAMODB_TIMELINE_TABLE=vaisu-timeline
DYNAMODB_TERMS_DEFINITIONS_TABLE=vaisu-terms-definitions
DYNAMODB_KNOWLEDGE_GRAPH_TABLE=vaisu-knowledge-graph

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
                if grep -q "^${key}=" "$BACKEND_ENV"; then
                    # Use a temporary file for sed to avoid in-place issues across platforms
                    sed "s/^${key}=.*/${key}=${value}/" "$BACKEND_ENV" > "$BACKEND_ENV.tmp" && mv "$BACKEND_ENV.tmp" "$BACKEND_ENV"
                else
                    echo "$key=$value" >> "$BACKEND_ENV"
                fi
            fi
        done < /tmp/aws-exports.env

        # Clean up backup file if it exists (from old sed -i)
        rm -f "$BACKEND_ENV.bak"
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
    grep "^S3_BUCKET_NAME\|^DYNAMODB_" "$BACKEND_ENV" | while read line; do
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