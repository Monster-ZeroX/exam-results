FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install pg @types/pg

# Copy app source code
COPY . .

# Update database driver from Neon to pg
RUN sed -i 's/import { Pool, neonConfig } from '"'"'@neondatabase\/serverless'"'"';/import { Pool } from '"'"'pg'"'"';/g' server/db.ts
RUN sed -i 's/import { drizzle } from '"'"'drizzle-orm\/neon-serverless'"'"';/import { drizzle } from '"'"'drizzle-orm\/node-postgres'"'"';/g' server/db.ts
RUN sed -i '/neonConfig.webSocketConstructor = ws;/d' server/db.ts
RUN sed -i 's/export const db = drizzle({ client: pool, schema });/export const db = drizzle(pool, { schema });/g' server/db.ts

# Build the application
RUN npm run build

# Create startup script that handles migrations
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 5000

# Set environment variables with default values (can be overridden)
ENV NODE_ENV=production
ENV DATABASE_URL=postgres://postgres:postgres@postgres:5432/results_db

# Create a non-root user and use it
RUN addgroup -S appuser && adduser -S appuser -G appuser
RUN chown -R appuser:appuser /app /docker-entrypoint.sh
USER appuser

# Start the application with the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]