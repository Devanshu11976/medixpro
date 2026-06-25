"""Invoice repository with specific invoice-related operations."""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.models import Invoice
from app.repositories.base import BaseRepository

class InvoiceRepository(BaseRepository[Invoice]):
    """Repository for Invoice model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(Invoice, session)
    
    async def get_by_status(self, status: str, skip: int = 0, limit: int = 100) -> List[Invoice]:
        """Get invoices by status."""
        result = await self.session.execute(
            select(Invoice).where(Invoice.status == status).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_pending_invoices(self, skip: int = 0, limit: int = 100) -> List[Invoice]:
        """Get all pending invoices."""
        return await self.get_by_status("Pending Review", skip, limit)
    
    async def update_status(self, invoice_id: str, status: str) -> Optional[Invoice]:
        """Update invoice status."""
        return await self.update(invoice_id, status=status)
    
    async def get_by_supplier(self, supplier_name: str, skip: int = 0, limit: int = 100) -> List[Invoice]:
        """Get invoices by supplier name."""
        result = await self.session.execute(
            select(Invoice).where(
                Invoice.supplier_name.ilike(f"%{supplier_name}%")
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_total_pending_amount(self) -> float:
        """Get total amount of pending invoices."""
        result = await self.session.execute(
            select(func.sum(Invoice.amount)).where(Invoice.status == "Pending Review")
        )
        return result.scalar() or 0.0
    
    async def get_recent_invoices(self, limit: int = 10) -> List[Invoice]:
        """Get recent invoices."""
        result = await self.session.execute(
            select(Invoice).order_by(Invoice.uploaded_at.desc()).limit(limit)
        )
        return list(result.scalars().all())
