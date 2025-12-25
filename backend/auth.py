from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
import hashlib
import secrets
from typing import Optional
from .database import db
import os

# Security configs
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='api/login')
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    async def hash_password(password: str) -> str:
        return pwd_context.hash(password)
    
    @staticmethod
    async def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    async def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    @staticmethod
    async def create_refresh_token() -> str:
        return secrets.token_urlsafe(64)
    
    @staticmethod
    async def hash_token(token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()
    
    @staticmethod
    async def store_refresh_token(user_id: int, token: str, device_info: str = ""):
        token_hash = await AuthService.hash_token(token)
        expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        db.execute_query(
            "INSERT INTO refresh_tokens (user_id, token_hash, device_info, expires_at) VALUES (?, ?, ?, ?)",
            (user_id, token_hash, device_info, expires_at),
            commit=True
        )
    
    @staticmethod
    async def verify_refresh_token(token: str) -> Optional[int]:
        token_hash = await AuthService.hash_token(token)
        
        result = db.execute_query(
            "SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = ?",
            (token_hash,),
            fetchone=True
        )
        
        if result and datetime.utcnow() < datetime.fromisoformat(result['expires_at']):
            return result['user_id']
        return None
    
    @staticmethod
    async def delete_refresh_token(token: str):
        token_hash = await AuthService.hash_token(token)
        db.execute_query(
            "DELETE FROM refresh_tokens WHERE token_hash = ?",
            (token_hash,),
            commit=True
        )
    
    @staticmethod
    async def decode_token(token: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None
    
    @staticmethod
    async def validate_password(password: str) -> list:
        errors = []
        if len(password) < 8:
            errors.append("Password must be at least 8 characters")
        if not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        return errors
    @staticmethod
    async def get_current_user(token: str = Depends(oauth2_scheme)):
        credentials_expection = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise credentials_expection
        except JWTError:
            raise credentials_expection
        
        user = db.execute_query(
            "SELECT id, username, role FROM users WHERE id = ?",
            (user_id,),
            fetchone=True 
        )
        if user is None:
            raise credentials_expection
        return dict(user)