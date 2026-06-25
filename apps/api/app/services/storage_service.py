"""Supabase Storage service for file management."""
import os
import logging
from typing import Optional, BinaryIO, List
from supabase import create_client, Client
from config import settings

logger = logging.getLogger(__name__)

class StorageService:
    """Service for managing Supabase Storage operations."""
    
    def __init__(self):
        self.supabase: Optional[Client] = None
        self.bucket_name = "medixpro-files"
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client."""
        try:
            if settings.supabase_url and settings.supabase_key:
                self.supabase = create_client(
                    settings.supabase_url,
                    settings.supabase_key
                )
                logger.info("Supabase client initialized successfully")
            else:
                logger.warning("Supabase credentials not configured")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
    
    async def upload_file(
        self,
        file_path: str,
        file_data: BinaryIO,
        content_type: str,
        upsert: bool = False
    ) -> Optional[str]:
        """
        Upload a file to Supabase Storage.
        
        Args:
            file_path: Path in the bucket (e.g., "invoices/invoice_001.pdf")
            file_data: File data to upload
            content_type: MIME type of the file
            upsert: Whether to overwrite existing file
        
        Returns:
            Public URL of the uploaded file or None on failure
        """
        try:
            if not self.supabase:
                logger.error("Supabase client not initialized")
                return None
            
            # Upload file
            result = self.supabase.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_data,
                file_options={"content-type": content_type, "upsert": str(upsert).lower()}
            )
            
            if result.data:
                public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(file_path)
                logger.info(f"File uploaded successfully: {file_path}")
                return public_url
            else:
                logger.error(f"File upload failed: {result.error}")
                return None
                
        except Exception as e:
            logger.error(f"Error uploading file {file_path}: {str(e)}")
            return None
    
    async def download_file(self, file_path: str) -> Optional[bytes]:
        """
        Download a file from Supabase Storage.
        
        Args:
            file_path: Path in the bucket
        
        Returns:
            File data as bytes or None on failure
        """
        try:
            if not self.supabase:
                logger.error("Supabase client not initialized")
                return None
            
            result = self.supabase.storage.from_(self.bucket_name).download(file_path)
            
            if result.data:
                logger.info(f"File downloaded successfully: {file_path}")
                return result.data
            else:
                logger.error(f"File download failed: {result.error}")
                return None
                
        except Exception as e:
            logger.error(f"Error downloading file {file_path}: {str(e)}")
            return None
    
    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from Supabase Storage.
        
        Args:
            file_path: Path in the bucket
        
        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.supabase:
                logger.error("Supabase client not initialized")
                return False
            
            result = self.supabase.storage.from_(self.bucket_name).remove([file_path])
            
            if result.data:
                logger.info(f"File deleted successfully: {file_path}")
                return True
            else:
                logger.error(f"File deletion failed: {result.error}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {str(e)}")
            return False
    
    async def get_public_url(self, file_path: str) -> Optional[str]:
        """
        Get the public URL for a file.
        
        Args:
            file_path: Path in the bucket
        
        Returns:
            Public URL or None on failure
        """
        try:
            if not self.supabase:
                logger.error("Supabase client not initialized")
                return None
            
            url = self.supabase.storage.from_(self.bucket_name).get_public_url(file_path)
            return url
            
        except Exception as e:
            logger.error(f"Error getting public URL for {file_path}: {str(e)}")
            return None
    
    async def list_files(self, prefix: str = "", limit: int = 100) -> List[str]:
        """
        List files in the bucket with optional prefix.
        
        Args:
            prefix: Path prefix to filter files
            limit: Maximum number of files to return
        
        Returns:
            List of file paths
        """
        try:
            if not self.supabase:
                logger.error("Supabase client not initialized")
                return []
            
            result = self.supabase.storage.from_(self.bucket_name).list(path=prefix, limit=limit)
            
            if result.data:
                files = [file["name"] for file in result.data]
                logger.info(f"Listed {len(files)} files with prefix: {prefix}")
                return files
            else:
                logger.error(f"File listing failed: {result.error}")
                return []
                
        except Exception as e:
            logger.error(f"Error listing files with prefix {prefix}: {str(e)}")
            return []
    
    async def move_file(self, old_path: str, new_path: str) -> bool:
        """
        Move a file within the bucket.
        
        Args:
            old_path: Current path of the file
            new_path: New path for the file
        
        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.supabase:
                logger.error("Supabase client not initialized")
                return False
            
            result = self.supabase.storage.from_(self.bucket_name).move(old_path, new_path)
            
            if result.data:
                logger.info(f"File moved from {old_path} to {new_path}")
                return True
            else:
                logger.error(f"File move failed: {result.error}")
                return False
                
        except Exception as e:
            logger.error(f"Error moving file from {old_path} to {new_path}: {str(e)}")
            return False
    
    async def copy_file(self, source_path: str, destination_path: str) -> bool:
        """
        Copy a file within the bucket.
        
        Args:
            source_path: Source file path
            destination_path: Destination file path
        
        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.supabase:
                logger.error("Supabase client not initialized")
                return False
            
            result = self.supabase.storage.from_(self.bucket_name).copy(source_path, destination_path)
            
            if result.data:
                logger.info(f"File copied from {source_path} to {destination_path}")
                return True
            else:
                logger.error(f"File copy failed: {result.error}")
                return False
                
        except Exception as e:
            logger.error(f"Error copying file from {source_path} to {destination_path}: {str(e)}")
            return False
    
    async def create_signed_url(self, file_path: str, expires_in: int = 3600) -> Optional[str]:
        """
        Create a signed URL for temporary access to a file.
        
        Args:
            file_path: Path in the bucket
            expires_in: Expiration time in seconds (default: 1 hour)
        
        Returns:
            Signed URL or None on failure
        """
        try:
            if not self.supabase:
                logger.error("Supabase client not initialized")
                return None
            
            result = self.supabase.storage.from_(self.bucket_name).create_signed_url(
                file_path,
                expires_in
            )
            
            if result.data:
                signed_url = result.data["signedURL"]
                logger.info(f"Signed URL created for {file_path}")
                return signed_url
            else:
                logger.error(f"Signed URL creation failed: {result.error}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating signed URL for {file_path}: {str(e)}")
            return None
    
    async def get_file_info(self, file_path: str) -> Optional[dict]:
        """
        Get metadata for a file.
        
        Args:
            file_path: Path in the bucket
        
        Returns:
            File metadata or None on failure
        """
        try:
            if not self.supabase:
                logger.error("Supabase client not initialized")
                return None
            
            # Get file info via list
            result = self.supabase.storage.from_(self.bucket_name).list(
                path=os.path.dirname(file_path),
                limit=1
            )
            
            if result.data:
                for file_info in result.data:
                    if file_info["name"] == os.path.basename(file_path):
                        return file_info
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting file info for {file_path}: {str(e)}")
            return None

# Global storage service instance
storage_service = StorageService()
