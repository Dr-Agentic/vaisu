#!/bin/bash

echo "🔍 Verifying Vaisu Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check Node.js version
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✓${NC} Node.js $(node -v) installed"
    else
        echo -e "${RED}✗${NC} Node.js version must be 18 or higher (found $(node -v))"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} Node.js not found"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm $(npm -v) installed"
else
    echo -e "${RED}✗${NC} npm not found"
    ERRORS=$((ERRORS + 1))
fi

# Check directory structure
echo ""
echo "Checking directory structure..."
DIRS=("frontend" "backend" "shared" "frontend/src" "backend/src" "shared/src")
for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir/ exists"
    else
        echo -e "${RED}✗${NC} $dir/ missing"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check package.json files
echo ""
echo "Checking package.json files..."
PACKAGES=("package.json" "frontend/package.json" "backend/package.json" "shared/package.json")
for pkg in "${PACKAGES[@]}"; do
    if [ -f "$pkg" ]; then
        echo -e "${GREEN}✓${NC} $pkg exists"
    else
        echo -e "${RED}✗${NC} $pkg missing"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check backend .env
echo ""
echo "Checking backend configuration..."
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env exists"
    
    # Check for API key
    if grep -q "OPENROUTER_API_KEY=sk-or-" backend/.env; then
        echo -e "${GREEN}✓${NC} OPENROUTER_API_KEY is set"
    else
        echo -e "${YELLOW}⚠${NC} OPENROUTER_API_KEY may not be configured correctly"
        echo "  Make sure it starts with 'sk-or-'"
    fi
else
    echo -e "${RED}✗${NC} backend/.env missing"
    echo "  Run: cp backend/.env.example backend/.env"
    echo "  Then add your OpenRouter API key"
    ERRORS=$((ERRORS + 1))
fi

# Check if node_modules exist
echo ""
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Root dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Root dependencies not installed"
    echo "  Run: npm install"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed"
    echo "  Run: npm install"
fi

if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Backend dependencies not installed"
    echo "  Run: npm install"
fi

# Check key files
echo ""
echo "Checking key files..."
KEY_FILES=(
    "frontend/src/App.tsx"
    "frontend/src/main.tsx"
    "frontend/index.html"
    "backend/src/server.ts"
    "shared/src/types.ts"
    "README.md"
    "QUICKSTART.md"
)
for file in "${KEY_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file missing"
        ERRORS=$((ERRORS + 1))
    fi
done

# Summary
echo ""
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Setup verification passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Make sure backend/.env has your OpenRouter API key"
    echo "2. Run: npm install (if not done)"
    echo "3. Run: npm run dev"
    echo "4. Open: http://localhost:5173"
    echo ""
    echo "See QUICKSTART.md for detailed instructions"
else
    echo -e "${RED}✗ Setup verification failed with $ERRORS error(s)${NC}"
    echo ""
    echo "Please fix the errors above and run this script again"
fi
echo "================================"
