## Description

### Liquidity Inventory Management System
The project has been developed using NestJS, Prisma ORM, and Swagger API documentation. The project is a simple inventory management system that allows you to manage products, categories, and orders. The project has been developed using the hexagonal architecture.
Even Driven Architecture has been used in the project. The project has been developed using the Prisma ORM.

- hexagonal architecture
- Even Driven Architecture
- Prisma ORM
- Swagger API documentation

the project structure:
- src
  - fx-rate
    - domain
    - adapter
  - liquidity
    - domain
    - adapter
  - revenue
    - domain
    - adapter
  - settlement
    - domain
    - adapter
  - transfer
    - domain
    - adapter
  - main.ts



## Project setup

```bash
$ npm install
```

## Compile and run the project

### Run the project dependencies

```bash
$ docker-compose up -d
```
### Init Database

```bash
$ npx prisma migrate dev --name init
```

### Run the application

```bash
$ npm run start
```

## Run tests

```bash
$ npm run test
```

## Swagger API documentation

link: http://localhost:3000/api

example curl fx-rate create:
```bash 
  curl -X 'POST' \
    'http://localhost:3000/fx-rate' \
    -H 'accept: */*' \
    -H 'Content-Type: application/json' \
    -d '{
    "pair": "USD/EUR",
    "rate": "8.1345",
    "timestamp": "2024-12-18T00:12:12.991Z"
  }'
```
example curl transfer create:
```bash 
  curl -X 'POST' \
    'http://localhost:3000/transfer' \
    -H 'accept: */*' \
    -H 'Content-Type: application/json' \
    -d '{
    "externalReferenceId": "id-123",
    "senderId": 1,
    "receiverId": 2,
    "amount": 10000,
    "currencyX": "USD",
    "currencyY": "EUR"
  }'
```

fx-rate mocker:
```bash 
  node mockFxRateSender.js http://127.0.0.1:3000/fx-rate
```
