Barbing Salon Booking System - Backend API
Overview

This is a RESTful API built with Flask and SQLite for a barbing salon booking system. It supports three roles:

Admin – Approves or rejects barbers.
Barber – Registers, manages services, and handles bookings.
Customer – Registers, views barbers, and books appointments.

The backend handles registration, login, forgot password, booking creation, updates, and cancellations.

CORS is enabled for frontend integration.

Features

Admin
-Login with hardcoded password.
-View pending barber registrations.
-Approve or reject barbers.

Barber
-Register and login.
-Forgot password functionality.
-Add services with prices.
-View bookings for their services.
-Update booking status (approve, reject, completed).

Customer
-Register and login.
-Forgot password functionality.
-View approved barbers.
-Book appointments with a barber.
-View and cancel own bookings (cancellations only allowed >2 hours before booked time).

Booking system
Prevents double booking for the same barber at the same date and time.
Location selection: shop or home service.

Project Structure
/barbing-api
├─ app.py               # Main Flask app
├─ models.py            # Database models
├─ database.py          # Database initialization
├─ config.py            # Config settings (SECRET_KEY, ADMIN_PASSWORD)
├─ requirements.txt     # Python dependencies

Installation

Clone the repository

git clone <your-repo-url>
cd barbing-api


Create a virtual environment and activate

python -m venv venv
On Mac: source venv/bin/activate   
On Windows: venv\Scripts\activate


Install dependencies

pip install -r requirements.txt


Run the app

python app.py


By default, the API will run on http://127.0.0.1:5000.

Configuration

Edit config.py to set:

SECRET_KEY = "your_secret_key_here"
ADMIN_PASSWORD = "admin_password_here"


SECRET_KEY is used for Flask sessions.
ADMIN_PASSWORD is the hardcoded password for admin login.

Endpoints
Admin
POST /admin/login – Login with hardcoded password.
GET /admin/pending-barbers – View pending barber registrations.
POST /admin/approve/<barber_id> – Approve a barber.
POST /admin/reject/<barber_id> – Reject a barber.

Barber
POST /barber/register – Register as barber.
POST /barber/login – Login.
POST /barber/forgot-password – Reset password using email or phone.
POST /barber/services – Add services.
GET /barber/bookings – View bookings.
PATCH /barber/booking/<booking_id> – Update booking status.

Customer
POST /customer/register – Register as customer.
POST /customer/login – Login.
POST /customer/forgot-password – Reset password using email or phone.
GET /barbers – List approved barbers.
POST /book – Book a barber.
GET /my-bookings – View own bookings.
DELETE /cancel/<booking_id> – Cancel a booking (if >2 hours before booked time).