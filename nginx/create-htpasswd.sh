#!/bin/sh
# This script generates the .htpasswd file with the specified credentials

# Install apache2-utils if htpasswd is not available
if ! command -v htpasswd &> /dev/null; then
    echo "htpasswd not found, installing apache2-utils..."
    apt-get update && apt-get install -y apache2-utils
fi

# Create .htpasswd file with MonsterZero:Monster@2024
htpasswd -cb .htpasswd MonsterZero Monster@2024

echo ".htpasswd file created successfully"