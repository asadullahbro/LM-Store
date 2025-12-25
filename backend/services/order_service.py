from ..database import db
from fastapi import HTTPException

class OrderService():
    @staticmethod
    def place_order(user_id: int):
        with db.get_connection() as conn:
            cursor = conn.cursor()
        
        # 1. Fetch cart items AND current stock levels
            cursor.execute('''
            SELECT c.product_id, c.quantity, p.price, p.stock, p.name 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
        ''', (user_id,))
        
            cart_items = cursor.fetchall()
        
            if not cart_items:
                raise HTTPException(status_code=400, detail="Cart is empty")

        # 2. Check stock levels BEFORE doing anything
            for item in cart_items:
                if item['stock'] < item['quantity']:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Not enough stock for {item['name']}. Available: {item['stock']}"
                    )
            total = sum(item['price'] * item['quantity'] for item in cart_items)

            try:
            # 3. Create Main Order
                cursor.execute(
                "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)", 
                (user_id, total, 'pending')
            )
                order_id = cursor.lastrowid

            # 4. Move items and REDUCE STOCK
                for item in cart_items:
                # Add to order_items
                    cursor.execute("""
                    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) 
                    VALUES (?, ?, ?, ?)
                """, (order_id, item['product_id'], item['quantity'], item["price"]))

                # NEW: Update the product stock in the database
                    cursor.execute("""
                    UPDATE products 
                    SET stock = stock - ? 
                    WHERE id = ?
                """, (item['quantity'], item['product_id']))

            # 5. Clear Cart
                cursor.execute("DELETE FROM cart WHERE user_id = ?", (user_id,))

            # 6. Commit everything
                conn.commit()
                return {"message": "order placed successfully", "order_id": order_id}

            except Exception as e:
                conn.rollback() 
                raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    @staticmethod
    def get_order_history(user_id: int):
        # We use execute_query here because it's a simple SELECT (Read-only)
        return db.execute_query(
            "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,), fetchall=True
        )