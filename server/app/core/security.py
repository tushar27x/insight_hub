from datetime import datetime, timedelta, UTC
from jose import jwt, JWTError
from typing import Optional, Dict, Any
from app.core.config import JWT_SECRET, ALGORITHM, ENCRYPTION_TOKEN
from cryptography.fernet import Fernet

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

# Initialize Fernet cipher suite
# Ensure ENCRYPTION_TOKEN is a valid base64-encoded 32-byte key
cipher_suite = Fernet(ENCRYPTION_TOKEN.encode()) if ENCRYPTION_TOKEN else None

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT for the user's session.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and verifies a JWT.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def encrypt_token(token: str) -> str:
    if not cipher_suite:
        raise ValueError("ENCRYPTION_TOKEN not configured")
    return cipher_suite.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str) -> str:
    if not cipher_suite:
        raise ValueError("ENCRYPTION_TOKEN not configured")
    return cipher_suite.decrypt(encrypted_token.encode()).decode()
