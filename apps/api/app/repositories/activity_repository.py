"""Activity log repository with specific activity-related operations."""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime
from app.models.models import ActivityLog
from app.repositories.base import BaseRepository

class ActivityRepository(BaseRepository[ActivityLog]):
    """Repository for ActivityLog model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(ActivityLog, session)
    
    async def get_by_actor(self, actor: str, skip: int = 0, limit: int = 100) -> List[ActivityLog]:
        """Get activities by actor."""
        result = await self.session.execute(
            select(ActivityLog).where(ActivityLog.actor == actor).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_by_category(self, category: str, skip: int = 0, limit: int = 100) -> List[ActivityLog]:
        """Get activities by category."""
        result = await self.session.execute(
            select(ActivityLog).where(ActivityLog.category == category).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_recent_activities(self, limit: int = 50) -> List[ActivityLog]:
        """Get recent activities."""
        result = await self.session.execute(
            select(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_by_date_range(
        self, start_date: datetime, end_date: datetime, skip: int = 0, limit: int = 100
    ) -> List[ActivityLog]:
        """Get activities within a date range."""
        result = await self.session.execute(
            select(ActivityLog).where(
                and_(
                    ActivityLog.timestamp >= start_date,
                    ActivityLog.timestamp <= end_date
                )
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def log_activity(
        self, actor: str, category: str, details: str, ip: Optional[str] = None
    ) -> ActivityLog:
        """Create a new activity log entry."""
        return await self.create(
            actor=actor,
            category=category,
            details=details,
            ip=ip
        )
