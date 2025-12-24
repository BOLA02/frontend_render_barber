API Documentation
Base URL: https://barbing-salon-api.onrender.com

All requests and responses use JSON.
Authentication is session-based (cookies must be preserved in Postman or frontend).

ADMIN ENDPOINTS
-Admin Login
POST /admin/login
Request body:
{
  "password": "admin123"
}

Success response:
{
  "msg": "Admin logged in"
}

Error response:
{
  "msg": "Invalid admin password"
}

-Get Pending Barbers
GET /admin/pending-barbers

Success response
[
  {
    "id": 1,
    "name": "Munir Mohammed",
    "shop_name": "Munir's Cuts",
    "phone": "08012345678"
  }
]

-Approve Barber
POST /admin/approve/<barber_id>

Response:
{
  "msg": "Barber approved"
}

-Reject Barber
POST /admin/reject/<barber_id>

Response:
{
  "msg": "Barber rejected"
}

BARBER ENDPOINTS
-Barber Register
POST /barber/register
Request body:
{
  "name": "Munir Mohammed",
  "phone": "08012345678",
  "email": "munir@gmail.com",
  "shop_name": "Munir's Cuts",
  "address": "AV16, Kaduna",
  "password": "password123"
}

Response:
{
  "msg": "Barber registered, awaiting approval"
}

-Barber Login
POST /barber/login

Request body:
{
  "login": "munir@gmail.com",
  "password": "password123"
}

Response:
{
  "msg": "Login successful",
  "status": "approved"
}

-Barber Forgot Password
POST /barber/forgot-password

Request body:
{
  "login": "munir@gmail.com",
  "new_password": "newpassword123"
}

Response:
{
  "msg": "Password updated successfully"
}

-Add Service
POST /barber/services

Request body:
{
  "name": "Haircut",
  "price": 1500
}

Response:
{
  "msg": "Service added"
}

-View Barber Bookings
GET /barber/bookings

Response:
[
  {
    "id": 1,
    "service": "Haircut",
    "date": "2025-12-25",
    "time": "12:00",
    "status": "pending"
  }
]

-Update Booking Status
PATCH /barber/booking/<booking_id>

Request body:
{
  "status": "completed"
}

Response:
{
  "msg": "Booking updated"
}

CUSTOMER ENDPOINTS
-Customer Register
POST /customer/register
Request body:
{
  "name": "Mubee",
  "phone": "08098765432",
  "email": "mubee@gmail.com",
  "password": "mypassword"
}

Response:
{
  "msg": "Customer registered"
}

-Customer Login
POST /customer/login

Request body:
{
  "login": "mubee@gmail.com",
  "password": "mypassword"
}

Response:
{
  "msg": "Login successful"
}

-Customer Forgot Password
POST /customer/forgot-password

Request body:
{
  "login": "mubee@gmail.com",
  "new_password": "newpass123"
}

Response:
{
  "msg": "Password updated successfully"
}

-List Approved Barbers
GET /barbers

Response:
[
  {
    "id": 1,
    "shop_name": "Munir's Cuts"
  }
]

-Book Barber
POST /book
Request body:
{
  "barber_id": 1,
  "service": "Haircut",
  "date": "2025-12-25",
  "time": "12:00",
  "location": "shop"
}

Success response:
{
  "msg": "Booking created"
}

Error (time already booked):
{
  "msg": "Time already booked"
}

-View Customer Bookings
GET /my-bookings

Response:
[
  {
    "id": 1,
    "date": "2025-12-25",
    "time": "12:00",
    "status": "pending"
  }
]

-Cancel Booking
DELETE /cancel/<booking_id>

Success response:
{
  "msg": "Booking cancelled"
}

Error (less than 2 hours):
{
  "msg": "Too late to cancel"
}

Important Notes
-Sessions are cookie-based; Postman must preserve cookies.
-All passwords are hashed.
-No JWT is used.
-Database is created automatically on first run.
-CORS is enabled for frontend integration.