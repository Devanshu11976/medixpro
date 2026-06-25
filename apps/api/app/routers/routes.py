from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Union, Any
import datetime
import time
import uuid
from collections import defaultdict

from database import get_db
from app.models import models
from app.schemas import schemas
from app.utils.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token, 
    decode_token
)
from app.utils.supabase_client import get_supabase_client

router = APIRouter()
security_bearer = HTTPBearer()

# In-memory rate limiting dictionary (Email -> timestamps)
LOGIN_ATTEMPTS = defaultdict(list)
RATE_LIMIT_WINDOW = 60 # seconds
RATE_LIMIT_MAX = 5 # max attempts per window

# ----------------- AUTH DEPENDENCY -----------------
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_bearer), db: AsyncSession = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token subject")
            
        user_res = await db.execute(select(models.User).where(models.User.id == int(user_id)))
        user = user_res.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired credentials")

# ----------------- AUTH ENDPOINTS -----------------
@router.post("/auth/register", response_model=schemas.TokenResponse)
async def register(payload: schemas.RetailerRegisterRequest, db: AsyncSession = Depends(get_db)):
    email = payload.email.lower()
    
    # Check if user exists
    existing = await db.execute(select(models.User).where(models.User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This email is already registered")
        
    # Create User record (Retailers default to PENDING status upon registration)
    new_user = models.User(
        email=email,
        password_hash=get_password_hash(payload.password),
        name=payload.owner_name,
        role="RETAILER",
        status="PENDING",
        auth_provider="LOCAL"
    )
    db.add(new_user)
    await db.flush()
    
    # Create Retailer profile
    new_retailer = models.Retailer(
        id=f"RET-{uuid.uuid4().hex[:6].upper()}",
        user_id=new_user.id,
        name=payload.shop_name,
        contact_person=payload.owner_name,
        email=email,
        phone=payload.phone,
        address=payload.address,
        balance=0.0,
        status="PENDING"
    )
    db.add(new_retailer)
    
    # Audit log
    audit = models.ActivityLog(
        actor=email,
        category="Auth",
        details="New retailer registration submitted. Status set to PENDING.",
        ip="127.0.0.1"
    )
    db.add(audit)
    await db.commit()
    
    # Issue initial tokens so the frontend can check status
    access = create_access_token(new_user.id)
    refresh = create_refresh_token(new_user.id)
    
    return {
        "access_token": access,
        "refresh_token": refresh,
        "role": new_user.role,
        "status": new_user.status,
        "email": new_user.email,
        "name": new_user.name,
        "profile_complete": True
    }

@router.post("/auth/login", response_model=schemas.TokenResponse)
async def login(payload: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    email = payload.email.lower()
    
    # 1. Rate Limiting Check
    current_time = time.time()
    LOGIN_ATTEMPTS[email] = [t for t in LOGIN_ATTEMPTS[email] if current_time - t < RATE_LIMIT_WINDOW]
    if len(LOGIN_ATTEMPTS[email]) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again after 60 seconds."
        )
    LOGIN_ATTEMPTS[email].append(current_time)

    # 2. Get User
    user_res = await db.execute(select(models.User).where(models.User.email == email))
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # 3. Account Lock Check
    if user.locked_until and user.locked_until > datetime.datetime.utcnow():
        time_left = int((user.locked_until - datetime.datetime.utcnow()).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Account is temporarily locked. Try again in {time_left} seconds."
        )

    # 4. Auth Provider check
    if user.auth_provider == "GOOGLE" and not user.password_hash:
        raise HTTPException(
            status_code=400,
            detail="This account is registered via Google SSO. Please use Continue with Google."
        )
    
    # 5. Ensure Admin/Worker cannot use Google auth
    if user.role in ["ADMIN", "WORKER"] and user.auth_provider == "GOOGLE":
        raise HTTPException(
            status_code=403,
            detail="Admin and Worker accounts must use email/password authentication. Google auth is only for retailers."
        )

    # 6. Verify Password
    if not verify_password(payload.password, user.password_hash):
        user.failed_attempts += 1
        if user.failed_attempts >= 5:
            user.locked_until = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
            db.add(user)
            await db.commit()
            raise HTTPException(
                status_code=400,
                detail="Too many failed attempts. Your account has been locked for 15 minutes."
            )
        db.add(user)
        await db.commit()
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Reset attempts on success
    user.failed_attempts = 0
    user.locked_until = None
    db.add(user)
    await db.commit()

    # 7. Check Roles / Status
    # Even if PENDING, we return tokens so frontend can display "Your account is awaiting admin approval."
    # But if DISABLED, we block immediately
    if user.status == "DISABLED":
        raise HTTPException(status_code=403, detail="Your account has been disabled. Contact support.")

    # 8. Access Tokens
    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)
    
    # Audit log
    audit = models.ActivityLog(
        actor=user.email,
        category="Auth",
        details=f"Successful credentials login as {user.role}.",
        ip="127.0.0.1"
    )
    db.add(audit)
    await db.commit()

    return {
        "access_token": access,
        "refresh_token": refresh,
        "role": user.role,
        "status": user.status,
        "email": user.email,
        "name": user.name,
        "profile_complete": True
    }

@router.post("/auth/google", response_model=schemas.TokenResponse)
async def google_auth(payload: schemas.GoogleAuthPayload, db: AsyncSession = Depends(get_db)):
    email = payload.email.lower()
    
    # Verify Supabase token
    try:
        supabase = get_supabase_client()
        user_response = supabase.auth.get_user(payload.google_token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid Supabase token")
        
        # Verify email matches
        if user_response.user.email.lower() != email:
            raise HTTPException(status_code=401, detail="Email mismatch in Supabase token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Supabase token verification failed: {str(e)}")
    
    user_res = await db.execute(select(models.User).where(models.User.email == email))
    user = user_res.scalar_one_or_none()
    
    first_time = False
    if not user:
        first_time = True
        user = models.User(
            email=email,
            password_hash=None,
            name=payload.name,
            role="RETAILER",
            status="PENDING",
            auth_provider="GOOGLE"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Ensure user is a retailer (Admin/Worker cannot use Google auth)
        if user.role != "RETAILER":
            raise HTTPException(
                status_code=403, 
                detail="Google authentication is only available for retailers. Admin and Worker must use email/password."
            )
        
        # Check if profile details exist
        ret_res = await db.execute(select(models.Retailer).where(models.Retailer.user_id == user.id))
        retailer = ret_res.scalar_one_or_none()
        if not retailer:
            first_time = True

    if user.status == "DISABLED":
        raise HTTPException(status_code=403, detail="Your account has been disabled. Contact support.")

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)

    # Put a flag in token payload or response metadata to tell frontend if profile is complete
    return {
        "access_token": access,
        "refresh_token": refresh,
        "role": user.role,
        "status": "PENDING" if first_time else user.status,
        "email": user.email,
        "name": user.name,
        "profile_complete": not first_time
    }

@router.post("/auth/complete-profile")
async def complete_profile(
    payload: schemas.RetailerProfileComplete,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "RETAILER":
        raise HTTPException(status_code=400, detail="Only retailers can complete profile details")
        
    ret_res = await db.execute(select(models.Retailer).where(models.Retailer.user_id == current_user.id))
    retailer = ret_res.scalar_one_or_none()
    
    if not retailer:
        retailer = models.Retailer(
            id=f"RET-{uuid.uuid4().hex[:6].upper()}",
            user_id=current_user.id,
            name=payload.shop_name,
            contact_person=payload.owner_name,
            email=current_user.email,
            phone=payload.phone,
            address=payload.address,
            balance=0.0,
            status="PENDING"
        )
        db.add(retailer)
    else:
        retailer.name = payload.shop_name
        retailer.contact_person = payload.owner_name
        retailer.phone = payload.phone
        retailer.address = payload.address
        db.add(retailer)
        
    current_user.status = "PENDING"
    db.add(current_user)
    
    # Audit log
    audit = models.ActivityLog(
        actor=current_user.email,
        category="Auth",
        details="Google signup profile details completed. Awaiting admin approval.",
        ip="127.0.0.1"
    )
    db.add(audit)
    await db.commit()
    
    return {"status": "success", "message": "Profile complete, awaiting approval"}

@router.post("/auth/refresh", response_model=schemas.TokenResponse)
async def refresh(payload: schemas.TokenRefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        decoded = decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
            
        user_id = decoded.get("sub")
        user_res = await db.execute(select(models.User).where(models.User.id == int(user_id)))
        user = user_res.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.status == "DISABLED":
            raise HTTPException(status_code=403, detail="Your account has been disabled.")
            
        access = create_access_token(user.id)
        new_refresh = create_refresh_token(user.id)
        
        return {
            "access_token": access,
            "refresh_token": new_refresh,
            "role": user.role,
            "status": user.status,
            "email": user.email,
            "name": user.name,
            "profile_complete": True
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

@router.get("/auth/me")
async def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "status": current_user.status,
        "auth_provider": current_user.auth_provider,
        "created_at": current_user.created_at
    }

# ----------------- MEDICINE ENDPOINTS -----------------
@router.get("/medicines", response_model=List[schemas.MedicineResponse])
async def get_medicines(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Medicine))
    return result.scalars().all()

@router.post("/medicines", response_model=schemas.MedicineResponse, status_code=status.HTTP_201_CREATED)
async def create_medicine(payload: schemas.MedicineCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(models.Medicine).where(models.Medicine.sku == payload.sku))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Medicine with this SKU already exists")
        
    med = models.Medicine(
        id=payload.id,
        name=payload.name,
        generic_name=payload.generic_name,
        sku=payload.sku,
        price=payload.price,
        stock=payload.stock,
        expiry_date=payload.expiry_date,
        rack_location=payload.rack_location
    )
    db.add(med)
    
    audit = models.ActivityLog(
        actor="admin@medixpro.com",
        category="Inventory",
        details=f"Added medicine {payload.name} (SKU: {payload.sku}) with stock {payload.stock}.",
        ip="127.0.0.1"
    )
    db.add(audit)
    await db.commit()
    await db.refresh(med)
    return med

# ----------------- RETAILER ENDPOINTS -----------------
@router.get("/retailers", response_model=List[schemas.RetailerResponse])
async def get_retailers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Retailer))
    return result.scalars().all()

@router.post("/retailers", response_model=schemas.RetailerResponse, status_code=status.HTTP_201_CREATED)
async def create_retailer(payload: schemas.RetailerCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(models.Retailer).where(models.Retailer.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Retailer with this email already exists")
        
    ret = models.Retailer(
        id=payload.id,
        name=payload.name,
        contact_person=payload.contact_person,
        email=payload.email,
        phone=payload.phone,
        balance=payload.balance,
        status=payload.status
    )
    db.add(ret)
    await db.commit()
    await db.refresh(ret)
    return ret

@router.get("/admin/retailers/pending")
async def list_pending_retailers(
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied")
    result = await db.execute(select(models.Retailer).where(models.Retailer.status == "PENDING"))
    return result.scalars().all()

@router.post("/admin/retailers/{retailer_id}/approve")
async def approve_retailer(
    retailer_id: str,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied")
        
    ret_res = await db.execute(select(models.Retailer).where(models.Retailer.id == retailer_id))
    retailer = ret_res.scalar_one_or_none()
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer not found")
        
    retailer.status = "ACTIVE"
    db.add(retailer)
    
    if retailer.user_id:
        user_res = await db.execute(select(models.User).where(models.User.id == retailer.user_id))
        user = user_res.scalar_one_or_none()
        if user:
            user.status = "ACTIVE"
            db.add(user)
            
    audit = models.ActivityLog(
        actor=current_user.email,
        category="Retailer",
        details=f"Approved retailer: {retailer.name} (Owner: {retailer.contact_person}).",
        ip="127.0.0.1"
    )
    db.add(audit)
    await db.commit()
    return {"status": "success", "message": "Retailer account approved and active"}

@router.post("/admin/retailers/{retailer_id}/reject")
async def reject_retailer(
    retailer_id: str,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied")
        
    ret_res = await db.execute(select(models.Retailer).where(models.Retailer.id == retailer_id))
    retailer = ret_res.scalar_one_or_none()
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer not found")
        
    retailer.status = "DISABLED"
    db.add(retailer)
    
    if retailer.user_id:
        user_res = await db.execute(select(models.User).where(models.User.id == retailer.user_id))
        user = user_res.scalar_one_or_none()
        if user:
            user.status = "DISABLED"
            db.add(user)
            
    audit = models.ActivityLog(
        actor=current_user.email,
        category="Retailer",
        details=f"Rejected and disabled retailer: {retailer.name}.",
        ip="127.0.0.1"
    )
    db.add(audit)
    await db.commit()
    return {"status": "success", "message": "Retailer account rejected and disabled"}

@router.post("/admin/retailers/{retailer_id}/toggle-status")
async def toggle_retailer_status(
    retailer_id: str,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied")
        
    ret_res = await db.execute(select(models.Retailer).where(models.Retailer.id == retailer_id))
    retailer = ret_res.scalar_one_or_none()
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer not found")
        
    new_status = "DISABLED" if retailer.status == "ACTIVE" else "ACTIVE"
    retailer.status = new_status
    db.add(retailer)
    
    if retailer.user_id:
        user_res = await db.execute(select(models.User).where(models.User.id == retailer.user_id))
        user = user_res.scalar_one_or_none()
        if user:
            user.status = new_status
            db.add(user)
            
    audit = models.ActivityLog(
        actor=current_user.email,
        category="Retailer",
        details=f"Toggled retailer {retailer.name} status to {new_status}.",
        ip="127.0.0.1"
    )
    db.add(audit)
    await db.commit()
    return {"status": "success", "message": f"Retailer status changed to {new_status}"}

# ----------------- ORDER ENDPOINTS -----------------
@router.get("/orders", response_model=List[schemas.OrderResponse])
async def get_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Order))
    return result.scalars().all()

@router.post("/orders", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(payload: schemas.OrderCreate, db: AsyncSession = Depends(get_db)):
    ret_res = await db.execute(select(models.Retailer).where(models.Retailer.id == payload.retailer_id))
    retailer = ret_res.scalar_one_or_none()
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer not found")
        
    order = models.Order(
        id=payload.id,
        retailer_id=payload.retailer_id,
        total_amount=payload.total_amount,
        status="Pending"
    )
    db.add(order)
    
    for item in payload.items:
        med_res = await db.execute(select(models.Medicine).where(models.Medicine.id == item.medicine_id))
        med = med_res.scalar_one_or_none()
        if not med:
            raise HTTPException(status_code=404, detail=f"Medicine ID {item.medicine_id} not found")
            
        order_item = models.OrderItem(
            order_id=payload.id,
            medicine_id=item.medicine_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(order_item)
        
        med.stock = max(0, med.stock - item.quantity)
        db.add(med)
        
    retailer.balance += payload.total_amount
    db.add(retailer)
    
    audit = models.ActivityLog(
        actor=retailer.email,
        category="Orders",
        details=f"Retailer submitted order {payload.id} with total amount ${payload.total_amount:.2f}.",
        ip="127.0.0.1"
    )
    db.add(audit)
    await db.commit()
    await db.refresh(order)
    return order

# ----------------- INVOICE / OCR ENDPOINTS -----------------
@router.get("/invoices", response_model=List[schemas.InvoiceResponse])
async def get_invoices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Invoice))
    return result.scalars().all()

@router.post("/invoices/ocr")
async def process_invoice_ocr(db: AsyncSession = Depends(get_db)):
    extracted_items = [
        {"id": "MED-001", "name": "Paracetamol 500mg", "qty": 5000, "price": 2.50, "batch": "BTH-2026-0902"},
        {"id": "MED-002", "name": "Amoxicillin 250mg", "qty": 2500, "price": 8.00, "batch": "BTH-2026-0903"}
    ]
    
    for item in extracted_items:
        med_res = await db.execute(select(models.Medicine).where(models.Medicine.id == item["id"]))
        med = med_res.scalar_one_or_none()
        if med:
            med.stock += item["qty"]
            db.add(med)
            
    invoice = models.Invoice(
        id=f"INV-2026-{int(datetime.datetime.utcnow().timestamp())}",
        supplier_name="Simulated PharmaCorp OCR",
        amount=25000.00,
        status="Approved"
    )
    db.add(invoice)
    
    audit = models.ActivityLog(
        actor="admin@medixpro.com",
        category="Inventory",
        details="OCR scanned invoice processed. Synced stock: +5000 units Paracetamol, +2500 units Amoxicillin.",
        ip="127.0.0.1"
    )
    db.add(audit)
    await db.commit()
    
    return {
        "status": "success",
        "extracted_invoice_id": invoice.id,
        "items": extracted_items
    }

# ----------------- ACTIVITY LOGS -----------------
@router.get("/activity-logs", response_model=List[schemas.ActivityLogResponse])
async def get_activity_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()))
    return result.scalars().all()
