#!/bin/bash
# Initialization script for deployment

# Create necessary directories
mkdir -p nginx/ssl
mkdir -p data

# Check if the data file exists
if [ ! -f "data/allresults.jsonl" ]; then
  echo "WARNING: data/allresults.jsonl file doesn't exist"
  echo "You need to place the data file in the data directory before running docker-compose up"
fi

# Check if .htpasswd exists, create if not
if [ ! -f "nginx/.htpasswd" ]; then
  echo "Creating .htpasswd file with default credentials (MonsterZero:Monster@2024)"
  echo "MonsterZero:$(openssl passwd -apr1 Monster@2024)" > nginx/.htpasswd
fi

# Generate self-signed SSL certificate (for development only)
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
  echo "Generating self-signed SSL certificate"
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
fi

echo "Initialization complete. You can now run:"
echo "docker-compose up -d"
echo ""
echo "After deployment, access the application at http://localhost or https://localhost"
echo "Username: MonsterZero"
echo "Password: Monster@2024"