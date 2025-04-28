#!/bin/sh
set -e

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
  echo "Waiting for PostgreSQL to be ready..."
  
  # Try to connect to PostgreSQL, retry with backoff
  RETRIES=10
  until [ $RETRIES -eq 0 ] || node -e "
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.query('SELECT 1').then(() => {
      console.log('PostgreSQL is ready');
      process.exit(0);
    }).catch(err => {
      console.error('PostgreSQL connection error:', err);
      process.exit(1);
    });
  "; do
    echo "PostgreSQL is unavailable - sleeping"
    RETRIES=$((RETRIES - 1))
    sleep 5
  done
  
  if [ $RETRIES -eq 0 ]; then
    echo "Failed to connect to PostgreSQL after multiple attempts"
    exit 1
  fi
}

# Wait for PostgreSQL to be ready
wait_for_postgres

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Start the application
echo "Starting the application..."
exec node dist/index.js