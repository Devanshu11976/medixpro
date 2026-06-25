"""Medicine repository with specific medicine-related operations."""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from datetime import datetime
from app.models.models import Medicine
from app.repositories.base import BaseRepository

class MedicineRepository(BaseRepository[Medicine]):
    """Repository for Medicine model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(Medicine, session)
    
    async def get_by_sku(self, sku: str) -> Optional[Medicine]:
        """Get medicine by SKU."""
        result = await self.session.execute(select(Medicine).where(Medicine.sku == sku))
        return result.scalar_one_or_none()
    
    async def search_by_name(self, name: str, skip: int = 0, limit: int = 100) -> List[Medicine]:
        """Search medicines by name (partial match)."""
        result = await self.session.execute(
            select(Medicine).where(
                Medicine.name.ilike(f"%{name}%")
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_low_stock(self, threshold: int = 10, skip: int = 0, limit: int = 100) -> List[Medicine]:
        """Get medicines with low stock."""
        result = await self.session.execute(
            select(Medicine).where(
                Medicine.stock <= threshold
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_expiring_soon(self, days: int = 30, skip: int = 0, limit: int = 100) -> List[Medicine]:
        """Get medicines expiring within specified days."""
        expiry_threshold = datetime.utcnow() + datetime.timedelta(days=days)
        result = await self.session.execute(
            select(Medicine).where(
                and_(
                    Medicine.expiry_date.isnot(None),
                    Medicine.expiry_date <= expiry_threshold.strftime("%Y-%m-%d")
                )
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_expired(self, skip: int = 0, limit: int = 100) -> List[Medicine]:
        """Get expired medicines."""
        result = await self.session.execute(
            select(Medicine).where(
                and_(
                    Medicine.expiry_date.isnot(None),
                    Medicine.expiry_date < datetime.utcnow().strftime("%Y-%m-%d")
                )
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def update_stock(self, medicine_id: str, quantity: int) -> Optional[Medicine]:
        """Update medicine stock (add or subtract)."""
        medicine = await self.get_by_id(medicine_id)
        if medicine:
            medicine.stock += quantity
            await self.session.flush()
            await self.session.refresh(medicine)
        return medicine
    
    async def set_stock(self, medicine_id: str, quantity: int) -> Optional[Medicine]:
        """Set medicine stock to exact value."""
        medicine = await self.get_by_id(medicine_id)
        if medicine:
            medicine.stock = quantity
            await self.session.flush()
            await self.session.refresh(medicine)
        return medicine
    
    async def get_by_rack_location(self, rack_location: str, skip: int = 0, limit: int = 100) -> List[Medicine]:
        """Get medicines by rack location."""
        result = await self.session.execute(
            select(Medicine).where(
                Medicine.rack_location.ilike(f"%{rack_location}%")
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_in_stock(self, skip: int = 0, limit: int = 100) -> List[Medicine]:
        """Get all medicines that are in stock."""
        result = await self.session.execute(
            select(Medicine).where(Medicine.stock > 0).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_out_of_stock(self, skip: int = 0, limit: int = 100) -> List[Medicine]:
        """Get all medicines that are out of stock."""
        result = await self.session.execute(
            select(Medicine).where(Medicine.stock == 0).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
