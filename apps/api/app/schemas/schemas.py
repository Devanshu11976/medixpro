from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    status: str
    auth_provider: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    status: str
    email: str
    name: str
    profile_complete: Optional[bool] = None

class RetailerRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    shop_name: str
    owner_name: str
    phone: str
    address: str

class GoogleAuthPayload(BaseModel):
    email: EmailStr
    name: str
    google_token: str

class RetailerProfileComplete(BaseModel):
    shop_name: str
    owner_name: str
    phone: str
    address: str

class TokenRefreshRequest(BaseModel):
    refresh_token: str

# Medicine Schemas
class MedicineBase(BaseModel):
    id: str
    name: str
    generic_name: Optional[str] = None
    sku: str
    price: float
    stock: int
    expiry_date: Optional[str] = None
    rack_location: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class MedicineResponse(MedicineBase):
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Retailer Schemas
class RetailerBase(BaseModel):
    id: str
    name: str
    contact_person: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    balance: float = 0.0
    status: str = "Active"

class RetailerCreate(RetailerBase):
    pass

class RetailerResponse(RetailerBase):
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Order Item Schemas
class OrderItemBase(BaseModel):
    medicine_id: str
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: str

    class Config:
        from_attributes = True

# Order Schemas
class OrderBase(BaseModel):
    id: str
    retailer_id: str
    total_amount: float
    status: str = "Pending"

class OrderCreate(BaseModel):
    id: str
    retailer_id: str
    items: List[OrderItemCreate]
    total_amount: float

class OrderResponse(OrderBase):
    created_at: datetime.datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

# Invoice Schemas
class InvoiceBase(BaseModel):
    id: str
    supplier_name: str
    amount: float
    status: str = "Pending Review"

class InvoiceCreate(InvoiceBase):
    file_path: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    uploaded_at: datetime.datetime
    file_path: Optional[str] = None

    class Config:
        from_attributes = True

# Activity Log Schemas
class ActivityLogResponse(BaseModel):
    id: int
    actor: str
    category: str
    details: str
    ip: Optional[str] = None
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Invoice sync schemas
class InvoiceItemSync(BaseModel):
    name: str
    qty: int
    price: float
    batch: str

class InvoiceSyncPayload(BaseModel):
    supplier_name: str
    amount: float
    items: List[InvoiceItemSync]

