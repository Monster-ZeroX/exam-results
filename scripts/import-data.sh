#!/bin/bash
# This script imports data into the PostgreSQL database

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=result_db psql -h postgres -U results_user -d results_db -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing import command"

# Run the import script (make sure your import script is in the correct location)
NODE_ENV=production node import.js

echo "Data import completed"