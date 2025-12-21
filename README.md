# Barbing Salon Booking System API

This is a simple, realistic REST API built with Flask and Python for an online barbing salon booking system.  
It is designed for beginner and amateur developers who are still learning backend development.

The system supports:
- User registration and login using JWT authentication
- Role-based access (user and admin)
- Appointment booking with real-world constraints
- Admin management of appointments
- No third-party services (no email, no payments)

The API is tested using Postman and uses SQLite as the database.

---

## Features

### Authentication
- User registration
- User login with JWT
- Forgot password (reset by email lookup)
- JWT-based protected routes

### User Features
- Book an appointment
- View own appointments
- Cancel own appointments
- Appointments cannot overlap
- Appointments must be within working hours
- Appointments cannot be booked in the past

### Admin Features
- View all appointments
- Update appointment status
- Admin is a user with role = "admin"

### Business Rules
- Barber working hours: 10:00 AM – 10:00 PM
- Default appointment duration: 30 minutes
- Overlapping bookings are not allowed
- Only pending and approved appointments block time slots
- Cancelled and completed appointments free time slots

---

## Project Structure

barbing_api/
│
├── app.py
├── models.py
├── requirements.txt
└── barbing.db

---

## Requirements

- Python 3.9 or higher
- pip

## Installation

1. Clone or download the project
2. Navigate into the project directory
3. Install dependencies


pip install -r requirements.txt

Running the Application
Start the server using:
python app.py

The API will run on:


http://127.0.0.1:5000

Database
SQLite is used

Database file: barbing.db
Tables are automatically created on first run
You may delete barbing.db to reset the system

API Endpoints

Register User

POST /register

Body:

{
  "name": "John Doe",
  "email": "john@test.com",
  "password": "123456"
}

Login
POST /login
Body:
{
  "email": "john@test.com",
  "password": "123456"
}

Response:
{
  "access_token": "JWT_TOKEN"
}

Forgot Password
POST /forgot-password
Body:
{
  "email": "john@test.com",
  "new_password": "newpassword"
}

Create Appointment
POST /appointments
Headers:

Authorization: Bearer JWT_TOKEN
Content-Type: application/json
Body:
{
  "service": "Hair Cut",
  "start_time": "2025-01-15 14:00",
  "duration": 30
}
Rules:

Must be within 10:00 AM – 10:00 PM

Must not overlap another appointment

Cannot be in the past

View Own Appointments
GET /appointments
Headers:
Authorization: Bearer JWT_TOKEN

Cancel Appointment
PUT /appointments/<id>/cancel
Headers:
Authorization: Bearer JWT_TOKEN


Admin Operations
Making a User an Admin
Admin is not a separate account type.
To make a user an admin, update the user role in the database.

Using SQLite:

UPDATE user SET role='admin' WHERE email='john@test.com';
After updating the role:

Login again

Use the new token for admin requests

View All Appointments (Admin Only)

GET /admin/appointments
Headers:
Authorization: Bearer ADMIN_JWT_TOKEN

Update Appointment Status (Admin Only)

PUT /admin/appointments/<id>
Headers:
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
Body:

{
  "status": "approved"
}
Valid statuses:

pending

approved

completed

cancelled

Postman Testing Flow
Register a user
Login and copy the JWT token
Set Authorization to Bearer Token in Postman
Create an appointment
View appointments
Cancel appointment (optional)
Change user role to admin
Login again
Test admin endpoints

