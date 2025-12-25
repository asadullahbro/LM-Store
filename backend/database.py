import sqlite3
from typing import Any

class Database:
    def __init__(self, db_name='backend/lmstore.db'):
        self.db_name = db_name
        self.init_db()

    # get connection
    def get_connection(self):
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    # initialize the db
    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # users table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                profile_url TEXT,
                role TEXT DEFAULT user,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)

            # refresh tokens table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                token_hash TEXT UNIQUE NOT NULL,
                device_info TEXT,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """)

            # products table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            image_url TEXT,
            stock INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1  -- 1 for active, 0 for deleted
        )
        """)

            # cart table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                product_id INTEGER,
                quantity INTEGER DEFAULT 1 CHECK(quantity > 0),
                UNIQUE(user_id, product_id),
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
            )
            """)

            # orders table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                total_amount REAL,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """)

            # order items table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                product_id INTEGER,
                quantity INTEGER CHECK(quantity > 0),
                price_at_purchase REAL,
                FOREIGN KEY(order_id) REFERENCES orders(id),
                FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
            )
            """)
            conn.commit()
            print("✅ Database Initialized")

    # helper function
    def execute_query(
        self,
        sql: str,
        params: tuple = (),
        commit: bool = False,
        fetchone: bool = False,
        fetchall: bool = False
    ) -> Any:
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(sql, params)

            if commit:
                conn.commit()
                return cursor.lastrowid

            if fetchone:
                row = cursor.fetchone()
                return dict(row) if row else None

            if fetchall:
                rows = cursor.fetchall()
                return [dict(row) for row in rows]

            return cursor
        finally:
            conn.close()

# export db instance
db = Database()
