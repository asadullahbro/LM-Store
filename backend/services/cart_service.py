from ..database import db

class CartService:
    @staticmethod
    #Get current user's cart
    def get_user_cart(user_id: int):
        query = """
        SELECT p.id as product_id, p.name, p.price, p.image_url, c.quantity 
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    """
        rows = db.execute_query(query, (user_id,), fetchall=True)
        return [dict(row) for row in rows]
    
    @staticmethod
    # Add item to the cart
    def add_item(user_id: int, product_id: int, qty: int = 1):

        product = db.execute_query(
            'SELECT stock FROM products WHERE id = ?', (product_id,), fetchone=True
        )
        if not product:
            return {
                "error": "Product not found"
            }
        existing = db.execute_query('''
    SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?
''', (user_id, product_id,), fetchone=True
        )
        current_in_cart = existing['quantity'] if existing else 0
        requested_total = current_in_cart + qty
        if product['stock'] < requested_total:
            return {
                "error": f"Only {product['stock']} available in stock. You already have {current_in_cart} in cart."
            }
        if existing:
            db.execute_query(
            "UPDATE cart SET quantity = ? WHERE id = ?",
            (requested_total, existing["id"]), commit=True
        )
        else:
            print(user_id, type(user_id))
            db.execute_query(
    """
    INSERT INTO cart (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, product_id)
    DO UPDATE SET quantity = quantity + excluded.quantity
    """,
    (user_id, product_id, qty),
    commit=True
)
        return {"message": "Success"}
    @staticmethod
    # Remove item from cart
    def remove_item(user_id: int, product_id: int):
        db.execute_query(
            "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
            (user_id, product_id,), commit=True
        )
