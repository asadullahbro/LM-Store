from pydantic import BaseModel
from typing import List, Optional

class LoginSchema(BaseModel):
    username: str
    password: str
class RegisterSchema(BaseModel):
    username: str
    password: str
class CartItemSchema(BaseModel):
    product_id: int
    quantity: int = 1
class ProductSchema(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    stock: int