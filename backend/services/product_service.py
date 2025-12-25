from ..database import db

class ProductService:
    @staticmethod
    #Get all products
    def get_all_products():
        rows =  db.execute_query(
            "SELECT * FROM products WHERE is_active = 1",
            fetchall=True
        )
        return [dict(row) for row in rows]
    @staticmethod
    #Get product details
    def get_product_details(product_id: int):
        return db.execute_query(
            "SELECT * FROM products WHERE id = ?",
            (product_id,),
            fetchone=True
        )
    @staticmethod
    #Search for a product
    def search_products(query:str):
        return db.execute_query(
            "SELECT * FROM product WHERE name LIKE ? OR description LIKE ?",
            (f"%{query}%", f"%{query}%"),
            fetchall=True
        )
    @staticmethod
    def update_stock(product_id: int, quantity: int):
        db.execute_query(
            "UPDATE products SET stock = ? WHERE id = ?",
            (quantity, product_id),
            commit=True
        )
    @staticmethod
    def deactivate_product(product_id: int):
        db.execute_query(
            "UPDATE products SET is_active = 0 WHERE id = ?",
            (product_id,),
            commit=True
        )
    @staticmethod
    def get_archived_products():
        return db.execute_query('SELECT * FROM products WHERE is_active = 0', fetchall=True)
    @staticmethod
    def restore_product(product_id: int):
        return db.execute_query('UPDATE products SET is_active = 1 WHERE id = ?', (product_id,), commit=True)
    