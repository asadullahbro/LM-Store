import sys
import os
import asyncio
DEFAULT_ADMIN = "" # <-- Insert admin name
DEFAULT_ADMIN_PASSWORD = "" # <-- Insert admin password
# --- PATH FIX START ---
# Get the absolute path of the folder this script is in (the 'backend' folder)
current_dir = os.path.dirname(os.path.abspath(__file__))
# Add that folder to Python's search list
sys.path.append(current_dir)
# --- PATH FIX END ---

from database import db
from auth import AuthService  # Make sure your file is named auth.py

async def seed_data():
    print("Starting seed process...")
    
    # 1. Create a Admin User
    hashed_pw = await AuthService.hash_password(DEFAULT_ADMIN_PASSWORD)
    db.execute_query(
        "INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)",
        (DEFAULT_ADMIN, hashed_pw, "admin"),
        commit=True
    )

    # 2. Add some "Tech Gear" to the store
    products = [
        ("Quantum RGB Keyboard", "Mechanical switches with full RGB.", 89.99, "https://placehold.co/400x400?text=Keyboard", 50),
        ("Apex Wireless Mouse", "High precision 20k DPI sensor.", 59.99, "https://placehold.co/400x400?text=Mouse", 100),
        ("Ultrawide 34-inch Monitor", "144Hz curved gaming display.", 449.99, "https://placehold.co/400x400?text=Monitor", 15),
        ("Studio Headset", "Noise cancelling over-ear headphones.", 129.99, "https://placehold.co/400x400?text=Headset", 30),
        ("Ergo Desk Chair", "Memory foam lumbar support.", 299.99, "https://placehold.co/400x400?text=Chair", 10)
    ]

    for p in products:
        db.execute_query(
            "INSERT INTO products (name, description, price, image_url, stock) VALUES (?, ?, ?, ?, ?)",
            p,
            commit=True
        )

    print("✅ Successfully seeded Asadullah's LM Store with products!")

if __name__ == "__main__":
    asyncio.run(seed_data())
