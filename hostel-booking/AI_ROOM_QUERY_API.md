# AI Room Query API Documentation

## Overview
The POST `/api/ai/room-query` endpoint provides natural language room search functionality using Claude AI (claude-haiku-4-5) to interpret user queries and return matching rooms from the database.

## Endpoint
```
POST /booking/api/ai/room-query
```

## Request Body
```json
{
  "question": "string"
}
```

### Parameters
- `question` (required): Natural language question about hostel rooms (max 500 characters)

## Response Format
```json
{
  "success": true,
  "question": "show 3-seater rooms under 5000",
  "intent": {
    "seaterType": 3,
    "minFee": null,
    "maxFee": 5000,
    "statusFilter": null,
    "sortBy": null,
    "sortOrder": "asc"
  },
  "count": 2,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "roomNumber": "101",
      "seaterType": 3,
      "totalSeats": 3,
      "monthlyFee": 4500,
      "occupiedSeats": 1,
      "seatsLeft": 2,
      "status": "Available"
    }
  ]
}
```

## Supported Query Types

### Seater Type Filters
- "2-seater rooms", "3 sharing", "4 bed rooms"
- "double rooms", "triple rooms", "quadruple rooms"

### Price Filters
- "under 5000", "below 8000", "cheaper than 10000"
- "between 3000 and 8000", "from 5000 to 12000"
- "minimum 4000", "at least 5000"

### Status Filters
- "available rooms", "only available"
- "full rooms", "occupied rooms"

### Sorting
- "cheapest", "lowest price", "ascending price"
- "most expensive", "highest price", "descending price"
- "sorted by room number", "alphabetical"

## Example Queries

### Basic Queries
- "show 3-seater rooms under 5000"
- "cheapest available 2 bed rooms"
- "4 sharing rooms sorted by price descending"
- "all available rooms between 3000 and 8000"

### Complex Queries
- "show me available 3-seater rooms under 6000 sorted by price"
- "find the cheapest 2-seater rooms that are available"
- "list all 4-seater rooms between 4000 and 10000"

## Rate Limiting
- **10 requests per minute per IP address**
- Rate limit headers included in responses
- Retry after 60 seconds when limit exceeded

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "A 'question' string is required in the request body."
}
```

### 503 Service Unavailable
```json
{
  "success": false,
  "message": "AI service is not configured. Please set ANTHROPIC_API_KEY."
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many AI queries from this IP. Please wait a minute and try again."
}
```

## Setup Instructions

### 1. Set Environment Variable
```bash
# Windows (Command Prompt)
set ANTHROPIC_API_KEY=your_api_key_here

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="your_api_key_here"

# Linux/MacOS
export ANTHROPIC_API_KEY=your_api_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```

### 4. Test the Endpoint
```bash
curl -X POST http://localhost:3000/booking/api/ai/room-query \
  -H "Content-Type: application/json" \
  -d '{"question": "show 3-seater rooms under 5000"}'
```

## Room Schema
The endpoint queries rooms with the following MongoDB schema:
- `roomNumber`: string (e.g., "101", "A2")
- `seaterType`: number (2, 3, or 4)
- `price`: number (monthly fee in Indian Rupees)
- `status`: "Available" | "Full" (derived from occupancy)

## Live Occupancy Data
The endpoint enriches results with real-time occupancy information:
- `occupiedSeats`: Number of approved bookings
- `seatsLeft`: Available seats in the room
- `status`: Current availability status

## Security Considerations
- Input validation prevents malformed queries
- Rate limiting prevents abuse
- API key authentication required for Claude API
- Error messages don't expose sensitive information
