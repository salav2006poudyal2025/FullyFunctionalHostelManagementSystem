# Hostel Booking System - Backend API

A Node.js/Express backend API for hostel booking management system.

## Features

### Core API Endpoints

- **Authentication**: Session-based auth for warden and owner roles
- **Room Management**: CRUD operations for hostel rooms
- **Booking System**: Student booking requests with approval/rejection
- **Payment Tracking**: Monthly fee payment status management
- **Occupancy Monitoring**: Real-time room occupancy data

### Payment Management API

- `GET /booking/api/payments` - List approved students with payment status
- `PUT /booking/api/payments/:id` - Update individual payment status
- `POST /booking/api/payments/reset` - Bulk reset all payments to Pending

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install and start MongoDB:
   - MongoDB should be running on `mongodb://localhost:27017`

3. Seed the database with initial data:
   ```bash
   npm run seed
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. API available at `http://localhost:3000`

## Database

- **MongoDB Database**: `hostel-booking`
- **Collections**: `rooms`, `bookings`
- **ODM**: Mongoose for schema validation and data modeling

## Authentication

- **Warden**: username: `warden`, password: `warden123`
- **Owner**: username: `owner`, password: `owner123`

## API Documentation

### Bookings
- `POST /booking/api/bookings` - Submit booking request
- `GET /booking/api/bookings/pending` - Get pending bookings (warden/owner)
- `GET /booking/api/bookings` - Get all bookings (owner)
- `POST /booking/api/bookings/:id/approve` - Approve booking
- `POST /booking/api/bookings/:id/reject` - Reject booking
- `PUT /booking/api/bookings/:id` - Edit booking (owner)
- `DELETE /booking/api/bookings/:id` - Delete booking (owner)

### Rooms
- `GET /booking/api/rooms` - Get occupancy data
- `POST /booking/api/rooms` - Create new room (owner)
- `GET /booking/api/rooms/:id` - Get single room details (owner)
- `PUT /booking/api/rooms/:id` - Update room details (owner)
- `GET /booking/api/rooms/:roomNumber/students` - Get students in room

## Data Storage

Uses MongoDB with Mongoose ODM for persistent data storage. Database: `hostel-booking`, Collections: `rooms`, `bookings`.