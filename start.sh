#!/bin/bash
# Script to start the application

# Run the initialization script first
if [ -f "./scripts/init-deploy.sh" ]; then
  echo "Running initialization script..."
  chmod +x ./scripts/init-deploy.sh
  ./scripts/init-deploy.sh
fi

# Start the containers
echo "Starting containers..."
docker-compose up -d

# Wait a moment for services to start
sleep 5

# Check if the services are running
echo "Checking service status..."
docker-compose ps

echo ""
echo "Application is now running!"
echo "Access it at: http://localhost"
echo "Username: MonsterZero"
echo "Password: Monster@2024"
echo ""
echo "To view logs:"
echo "docker-compose logs -f"
echo ""
echo "To stop the application:"
echo "docker-compose down"