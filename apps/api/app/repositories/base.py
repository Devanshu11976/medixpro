"""Base repository with common CRUD operations and transaction support."""
from typing import TypeVar, Generic, Type, Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from sqlalchemy.orm import DeclarativeBase
import logging

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType", bound=DeclarativeBase)

class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations."""
    
    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session
    
    async def get_by_id(self, id: Any) -> Optional[ModelType]:
        """Get a single record by ID."""
        result = await self.session.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()
    
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        """Get all records with optional pagination and filtering."""
        query = select(self.model)
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.where(getattr(self.model, key) == value)
        
        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())
    
    async def create(self, **kwargs) -> ModelType:
        """Create a new record."""
        db_obj = self.model(**kwargs)
        self.session.add(db_obj)
        await self.session.flush()
        await self.session.refresh(db_obj)
        logger.info(f"Created {self.model.__name__}: {db_obj.id}")
        return db_obj
    
    async def update(self, id: Any, **kwargs) -> Optional[ModelType]:
        """Update an existing record."""
        db_obj = await self.get_by_id(id)
        if not db_obj:
            return None
        
        for key, value in kwargs.items():
            if hasattr(db_obj, key):
                setattr(db_obj, key, value)
        
        await self.session.flush()
        await self.session.refresh(db_obj)
        logger.info(f"Updated {self.model.__name__}: {id}")
        return db_obj
    
    async def delete(self, id: Any) -> bool:
        """Delete a record."""
        db_obj = await self.get_by_id(id)
        if not db_obj:
            return False
        
        await self.session.delete(db_obj)
        await self.session.flush()
        logger.info(f"Deleted {self.model.__name__}: {id}")
        return True
    
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count records with optional filtering."""
        query = select(func.count()).select_from(self.model)
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.where(getattr(self.model, key) == value)
        
        result = await self.session.execute(query)
        return result.scalar()
    
    async def exists(self, id: Any) -> bool:
        """Check if a record exists."""
        return await self.get_by_id(id) is not None
    
    async def bulk_create(self, objects: List[Dict[str, Any]]) -> List[ModelType]:
        """Create multiple records in a single transaction."""
        db_objects = [self.model(**obj) for obj in objects]
        self.session.add_all(db_objects)
        await self.session.flush()
        for obj in db_objects:
            await self.session.refresh(obj)
        logger.info(f"Bulk created {len(db_objects)} {self.model.__name__} records")
        return db_objects
    
    async def bulk_update(self, ids: List[Any], update_data: Dict[str, Any]) -> int:
        """Update multiple records with the same data."""
        query = update(self.model).where(self.model.id.in_(ids)).values(**update_data)
        result = await self.session.execute(query)
        await self.session.flush()
        logger.info(f"Bulk updated {result.rowcount} {self.model.__name__} records")
        return result.rowcount
    
    async def bulk_delete(self, ids: List[Any]) -> int:
        """Delete multiple records."""
        query = delete(self.model).where(self.model.id.in_(ids))
        result = await self.session.execute(query)
        await self.session.flush()
        logger.info(f"Bulk deleted {result.rowcount} {self.model.__name__} records")
        return result.rowcount
