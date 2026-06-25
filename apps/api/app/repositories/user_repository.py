"""User repository with specific user-related operations."""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime
from app.models.models import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    """Repository for User model."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    async def get_by_role(self, role: str, skip: int = 0, limit: int = 100) -> List[User]:
        """Get users by role."""
        result = await self.session.execute(
            select(User).where(User.role == role).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_active_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all active users."""
        result = await self.session.execute(
            select(User).where(User.status == "ACTIVE").offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_pending_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all pending users."""
        result = await self.session.execute(
            select(User).where(User.status == "PENDING").offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def increment_failed_attempts(self, user_id: int) -> Optional[User]:
        """Increment failed login attempts."""
        user = await self.get_by_id(user_id)
        if user:
            user.failed_attempts += 1
            await self.session.flush()
            await self.session.refresh(user)
        return user
    
    async def reset_failed_attempts(self, user_id: int) -> Optional[User]:
        """Reset failed login attempts."""
        user = await self.get_by_id(user_id)
        if user:
            user.failed_attempts = 0
            user.locked_until = None
            await self.session.flush()
            await self.session.refresh(user)
        return user
    
    async def lock_account(self, user_id: int, lock_minutes: int = 30) -> Optional[User]:
        """Lock user account for specified minutes."""
        user = await self.get_by_id(user_id)
        if user:
            user.locked_until = datetime.utcnow() + datetime.timedelta(minutes=lock_minutes)
            await self.session.flush()
            await self.session.refresh(user)
        return user
    
    async def is_account_locked(self, user_id: int) -> bool:
        """Check if account is currently locked."""
        user = await self.get_by_id(user_id)
        if not user or not user.locked_until:
            return False
        
        if user.locked_until < datetime.utcnow():
            # Auto-unlock if lock period has expired
            await self.reset_failed_attempts(user_id)
            return False
        
        return True
    
    async def update_status(self, user_id: int, status: str) -> Optional[User]:
        """Update user status."""
        return await self.update(user_id, status=status)
    
    async def get_retailers_with_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all retailer users."""
        result = await self.session.execute(
            select(User).where(User.role == "RETAILER").offset(skip).limit(limit)
        )
        return list(result.scalars().all())
