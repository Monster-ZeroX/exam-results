FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Set environment variables with default values (can be overridden)
ENV NODE_ENV=production
ENV DATABASE_URL=postgres://postgres:postgres@postgres:5432/results_db

# Create a non-root user and use it
RUN addgroup -S appuser && adduser -S appuser -G appuser
USER appuser

# Start the application
CMD ["node", "dist/index.js"]