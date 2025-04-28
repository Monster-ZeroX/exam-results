# Student Results Search Application

A full-stack application for searching student exam results with PostgreSQL database and React frontend.

## Features

- Search for students by name
- View detailed student results including scores and rankings
- Responsive design for all devices
- Basic authentication for security

## Technical Stack

- **Backend**: Node.js with Express
- **Frontend**: React with TailwindCSS and Shadcn UI components
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Basic Auth via Nginx
- **Containerization**: Docker

## Deployment Instructions

### Prerequisites

- Docker and Docker Compose installed
- Data file (`allresults.jsonl`) containing student records

### Quick Start

1. Clone this repository
2. Place your data file in the `data/` directory (create it if it doesn't exist)
3. Run the initialization script:

```bash
chmod +x scripts/init-deploy.sh
./scripts/init-deploy.sh
```

4. Start the containers:

```bash
docker-compose up -d
```

5. Access the application:
   - URL: http://localhost (or the domain name you've configured)
   - Username: MonsterZero
   - Password: Monster@2024

### Production Deployment

For production deployment, follow these additional steps:

1. Update the `nginx/nginx.conf` file to include your domain name
2. Obtain SSL certificates (Let's Encrypt recommended)
3. Update the NGINX configuration to use your SSL certificates
4. Ensure proper network security (firewall rules, etc.)

## Data Import

The initial data import will happen automatically when the containers start. If you need to import data manually:

```bash
docker-compose run --rm importer
```

## Customization

### Authentication

To change the username and password:

```bash
# Replace with your desired username and password
echo "YourUsername:$(openssl passwd -apr1 YourPassword)" > nginx/.htpasswd
```

### SSL Certificates

For production, replace the self-signed certificates with proper ones:

1. Place your certificates in `nginx/ssl/`
2. Update the `nginx/nginx.conf` file to use your certificate paths
3. Restart the nginx container:

```bash
docker-compose restart nginx
```

## Troubleshooting

### Database Connection Issues

If the application cannot connect to the database:

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Check if database is accessible
docker-compose exec postgres psql -U results_user -d results_db -c "SELECT 'connected';"
```

### Authentication Issues

If you're having trouble with authentication:

```bash
# Verify .htpasswd file is correct
docker-compose exec nginx cat /etc/nginx/.htpasswd
```