#!/usr/bin/env python3

"""
Script to create initial admin user
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Add the src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'src'))

from sqlalchemy.orm import Session
from database.connection import SessionLocal, engine
from database.models import Base, User
from services.auth import get_password_hash

def create_admin_user():
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print("Admin user already exists")
            return

        # Create admin user
        hashed_password = get_password_hash("admin123")  # Change this password!
        admin_user = User(
            username="admin",
            email="admin@librarybabylon.com",
            hashed_password=hashed_password,
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print("Admin user created successfully")
        print("Username: admin")
        print("Password: admin123")
        print("Please change the password after first login!")

    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()