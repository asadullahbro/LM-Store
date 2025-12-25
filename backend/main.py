from fastapi import FastAPI, Request, Response, HTTPException, Depends, status
from .auth import AuthService
from .database import db
from .services.cart_service import CartService
from .services.order_service import OrderService
from .services.product_service import ProductService
from .schemas import LoginSchema, RegisterSchema, CartItemSchema, ProductSchema
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
app = FastAPI()
#Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "Oops! Something went wrong on our side.", "details": str(exc)}
    )
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ 'http://192.168.18.14', 'http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*']
)
#functions
async def admin_required(current_user: dict = Depends(AuthService.get_current_user)):
    if not current_user or current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have admin privileges."
        )
    return current_user
# Authentication
@app.post('/api/register')
async def register(data: RegisterSchema):
    existing = db.execute_query("SELECT id FROM users WHERE username = ?", (data.username,), fetchone=True)
    pw_complexity = await AuthService.validate_password(data.password)
    if pw_complexity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password should atleast have 8 characters with numbers, lower case and upper case letters."
        )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists!")
    hashed_pw = await AuthService.hash_password(data.password)
    db.execute_query("INSERT INTO users (username, password) VALUES(?, ?)", (data.username, hashed_pw,), commit=True)
    return {"message": f"User with {data.username} created successfully"}

@app.post('/api/login')
async def login(data: LoginSchema, response: Response):
    user_row = db.execute_query(
        "SELECT id, username, password, role FROM users WHERE username = ?",
        (data.username,), fetchone=True
    )
    if not user_row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    user = dict(user_row)
    if not await AuthService.verify_password(data.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    refresh_token = await AuthService.create_refresh_token()
    token = await AuthService.create_access_token({'sub': str(user['id']), "role": user['role']})
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True
        )
    return {
        "access_token": token,
        "token_type": 'bearer',
        "user": {
            "id": user["id"],
            "username": user['username'],
            "role": user['role']
        }
    }
@app.post('/api/refresh')
async def refresh_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    user_id = await AuthService.verify_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
    user_row = db.execute_query(
        "SELECT id, username, role FROM users WHERE id = ?",
        (user_id,), fetchone=True
    )
    if not user_row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    user = dict(user_row)
    new_access_token = await AuthService.create_access_token({'sub': str(user['id']), "role": user['role']})
    new_refresh_token = await AuthService.create_refresh_token()
    await AuthService.delete_refresh_token(refresh_token)
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True
    )
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user['username'],
            "role": user['role']
        }
    }
# products
@app.get('/api/products')
async def get_all_products():
    return [dict(p) for p in ProductService.get_all_products()]

@app.get('/api/products/{product_id')
async def get_product(product_id: int):
    product = ProductService.get_product_details(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return dict(product)

    # cart
@app.get("/api/cart")
async def view_cart(current_user: dict = Depends(AuthService.get_current_user)):
    user_id = current_user['id']
    items = CartService.get_user_cart(user_id)
    return [dict(c) for c in items]

@app.post('/api/cart/add')
async def add_to_cart(item: CartItemSchema, current_user: dict = Depends(AuthService.get_current_user)):
    result = CartService.add_item(
        current_user['id'],
        item.product_id,
        item.quantity
    )
    if 'error' in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result['error']
        )
    return result
@app.delete("/api/cart/remove/{product_id}")
async def remove_from_cart(product_id: int, current_user: dict = Depends(AuthService.get_current_user)):
    CartService.remove_item(current_user['id'], product_id)
    return {"message": "Removed from cart"}

# orders
@app.post("/api/checkout")
async def checkout(current_user: dict = Depends(AuthService.get_current_user)):
    result = OrderService.place_order(current_user['id'])
    if "error" in result:
        raise HTTPException(status_code=400, detail=result['error'])
    return result

@app.get("/api/orders")
async def order_history(current_user: dict = Depends(AuthService.get_current_user)):
    orders = OrderService.get_order_history(current_user['id'])
    return [dict(o) for o in orders]

# Admin
@app.get('/api/admin/users', dependencies=[Depends(admin_required)])
async def get_admin_users():
    users = db.execute_query("SELECT id, username, role, created_at FROM users", fetchall=True)
    return[dict(u) for u in users]
@app.get('/api/admin/activities', dependencies=[Depends(admin_required)])
async def get_admin_activites():
    query = """
    SELECT u.username, o.id as order_id, o.total_amount, o.created_at
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
"""
    activites = db.execute_query(query, fetchall=True)
    return [dict(a) for a in activites]
@app.post("/api/admin/products", dependencies=[Depends(admin_required)])
async def admin_add_product(product: ProductSchema):
    query = """
        INSERT INTO products (name, description, price, image_url, stock)
        VALUES (?, ?, ?, ?, ?)
    """
    db.execute_query(query, (product.name, product.description, product.price, product.image_url, product.stock), commit=True)
    return {"status": "success", "message": f"Added {product.name}"}
@app.post("/api/admin/deactive/{product_id}", dependencies=[Depends(admin_required)])
async def admin_deactivate_product(product_id: int):
    ProductService.deactivate_product(product_id)
    return {"status": "success", "message": f"Deleted product with ID {product_id}"}
@app.put("/api/admin/product/{product_id}/stock", dependencies=[Depends(admin_required)])
async def update_stock(product_id: int, stock: int):
    ProductService.update_stock(product_id, stock)
    return {"status": "success", "message": f"Updated stock for product ID {product_id}"}
@app.post('/api/admin/products/restore/{product_id}', dependencies=[Depends(admin_required)])
async def restore_product(product_id: int):
    ProductService.restore_product(product_id)
    return {"message": f"Restored product #{product_id}"}
@app.get('/api/admin/products/archived', dependencies=[Depends(admin_required)])
async def get_archived_products():
    return [dict(p) for p in ProductService.get_archived_products()]