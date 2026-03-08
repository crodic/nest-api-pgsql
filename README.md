# Crodic Framework

A Nest application for framework.

## Technology Stack

### Backend

- **Framework**: NestJS
- **Database**: PostgreSQL/MySQL
- **Queue**: Redis
- **Testing**: Jest
- **Authentication**: Jwt/Passport
- **ORM**: TypeORM
- **API Documentation**: Swagger

### Required Containers

- PostgreSQL (Version 16) or MySQL (Version 8)
- Redis (Version 7)
- Mailpit or Maildev

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**

```bash
  git clone https://github.com/crodic/crodic.git
```

2. **Install Node dependencies**

```bash
    pnpm install
```

3. **Configure environment**

```bash
    cp .env.example .env
```

Then edit the `.env` file with your local configuration, especially database and queue settings.

4. **Migrate database**

```bash
    pnpm run migration:up
```

5. **Seed data**

```bash
    pnpm run seed:run
```

The application will be available at `http://localhost:8000`.

## Additional Notes

- [API document](http://localhost:8000/api-docs)
- [Monitoring Request](http://localhost:8000/nestlens)
- [Monitoring Queue](http://localhost:8000/api/queues)
