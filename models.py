from database import db
from datetime import datetime

class Barber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    phone = db.Column(db.String(20), unique=True)
    email = db.Column(db.String(100), unique=True)
    shop_name = db.Column(db.String(150))
    address = db.Column(db.String(200))
    password = db.Column(db.String(200))
    profile_pic = db.Column(db.String(200))
    shop_front_pic = db.Column(db.String(200))
    status = db.Column(db.String(20), default="pending")

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    phone = db.Column(db.String(20), unique=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(200))

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    barber_id = db.Column(db.Integer, db.ForeignKey("barber.id"))
    name = db.Column(db.String(100))
    price = db.Column(db.Float)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    barber_id = db.Column(db.Integer)
    customer_id = db.Column(db.Integer)
    service_name = db.Column(db.String(100))
    date = db.Column(db.String(20))
    time = db.Column(db.String(10))
    location = db.Column(db.String(20))
    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
