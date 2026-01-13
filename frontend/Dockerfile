FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Install serve to run the built app
RUN npm install -g serve

EXPOSE 7002
# Start nginx/serve
CMD ["serve", "-s", "dist", "-l", "7002"]
