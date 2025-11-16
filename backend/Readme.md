# Inventory Management System - Backend

## Overview
RESTful API built with Node.js and Express.js for managing inventory items.

## Technologies
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)

### Installation

1. Navigate to backend directory:
```bash
   cd backend
```

2. Install dependencies:
```bash
   npm install
```

3. Create .env file:
```bash
   cp .env.example .env
```

4. Start MongoDB:
```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
```

5. Start server:
```bash
   npm start
```

Server will run on http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/stats | Inventory statistics |
| GET | /api/items | Get all items |
| GET | /api/items/:id | Get single item |
| POST | /api/items | Create item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |

## Testing

Test health endpoint:
```bash
curl http://localhost:5000/api/health
```

Create item:
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Test Item",
    "quantity": 10,
    "price": 99.99,
    "category": "Electronics"
  }'
```