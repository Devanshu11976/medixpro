"""Retailer repository with specific retailer-related operations."""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.models import Retailer
from app.repositories.base import BaseRepository

class RetailerRepository(BaseRepository[Retailer]):
    """Repository for Retailer model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(Retailer, session)
    
    async def get_by_email(self, email: str) -> Optional[Retailer]:
        """Get retailer by email."""
        result = await self.session.execute(select(Retailer).where(Retailer.email == email))
        return result.scalar_one_or_none()
    
    async def get_by_user_id(self, user_id: int) -> Optional[Retailer]:
        """Get retailer by user ID."""
        result = await self.session.execute(select(Retailer).where(Retailer.user_id == user_id))
        return result.scalar_one_or_none()
    
    async def get_active_retailers(self, skip: int = 0, limit: int = 100) -> List[Retailer]:
        """Get all active retailers."""
        result = await self.session.execute(
            select(Retailer).where(Retailer.status == "ACTIVE").offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_pending_retailers(self, skip: int = 0, limit: int = 100) -> List[Retailer]:
        """Get all pending retailers."""
        result = await self.session.execute(
            select(Retailer).where(Retailer.status == "PENDING").offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def update_status(self, retailer_id: str, status: str) -> Optional[Retailer]:
        """Update retailer status."""
        return await self.update(retailer_id, status=status)
    
    async def update_balance(self, retailer_id: str, amount: float) -> Optional[Retailer]:
        """Update retailer balance (add or subtract)."""
        retailer = await self.get_by_id(retailer_id)
        if retailer:
            retailer.balance += amount
            await self.session.flush()
            await self.session.refresh(retailer)
        return retailer
    
    async def set_balance(self, retailer_id: str, amount: float) -> Optional[Retailer]:
        """Set retailer balance to exact value."""
        retailer = await self.get_by_id(retailer_id)
        if retailer:
            retailer.balance = amount
            await self.session.flush()
            await self.session.refresh(retailer)
        return retailer
    
    async def get_with_balance_due(self, min_balance: float = 0.01, skip: int = 0, limit: int = 100) -> List[Retailer]:
        """Get retailers with balance due."""
        result = await self.session.execute(
            select(Retailer).where(
                Retailer.balance >= min_balance
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def search_by_name(self, name: str, skip: int = 0, limit: int = 100) -> List[Retailer]:
        """Search retailers by name (partial match)."""
        result = await self.session.execute(
            select(Retailer).where(
                Retailer.name.ilike(f"%{name}%")
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_by_phone(self, phone: str) -> Optional[Retailer]:
        """Get retailer by phone number."""
        result = await self.session.execute(select(Retailer).where(Retailer.phone == phone))
        return result.scalar_one_or_none()
