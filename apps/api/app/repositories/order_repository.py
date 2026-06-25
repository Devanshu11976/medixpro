"""Order repository with specific order-related operations."""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.models.models import Order, OrderItem
from app.repositories.base import BaseRepository

class OrderRepository(BaseRepository[Order]):
    """Repository for Order model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(Order, session)
    
    async def get_by_retailer(self, retailer_id: str, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get orders by retailer ID."""
        result = await self.session.execute(
            select(Order).where(Order.retailer_id == retailer_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_by_status(self, status: str, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get orders by status."""
        result = await self.session.execute(
            select(Order).where(Order.status == status).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_pending_orders(self, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get all pending orders."""
        return await self.get_by_status("Pending", skip, limit)
    
    async def update_status(self, order_id: str, status: str) -> Optional[Order]:
        """Update order status."""
        return await self.update(order_id, status=status)
    
    async def get_with_items(self, order_id: str) -> Optional[Order]:
        """Get order with its items."""
        result = await self.session.execute(
            select(Order).where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()
        if order:
            # Load items through relationship
            await self.session.refresh(order, attribute_names=["items"])
        return order
    
    async def get_recent_orders(self, limit: int = 10) -> List[Order]:
        """Get recent orders."""
        result = await self.session.execute(
            select(Order).order_by(Order.created_at.desc()).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_total_retailer_orders(self, retailer_id: str) -> int:
        """Get total order count for a retailer."""
        result = await self.session.execute(
            select(func.count()).select_from(Order).where(Order.retailer_id == retailer_id)
        )
        return result.scalar()
    
    async def get_total_retailer_spending(self, retailer_id: str) -> float:
        """Get total spending for a retailer."""
        result = await self.session.execute(
            select(func.sum(Order.total_amount)).where(Order.retailer_id == retailer_id)
        )
        return result.scalar() or 0.0

class OrderItemRepository(BaseRepository[OrderItem]):
    """Repository for OrderItem model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(OrderItem, session)
    
    async def get_by_order(self, order_id: str, skip: int = 0, limit: int = 100) -> List[OrderItem]:
        """Get order items by order ID."""
        result = await self.session.execute(
            select(OrderItem).where(OrderItem.order_id == order_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_by_medicine(self, medicine_id: str, skip: int = 0, limit: int = 100) -> List[OrderItem]:
        """Get order items by medicine ID."""
        result = await self.session.execute(
            select(OrderItem).where(OrderItem.medicine_id == medicine_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
