"""
Cloudflare R2 storage service — S3 compatible.
Used for:
  - Storing uploaded files (PDF, TXT, MD)
  - Qdrant collection backups
"""
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from core.config import settings
from pathlib import Path
import time

_client = None

def get_client():
    global _client
    if _client is None:
        if not settings.r2_account_id or not settings.r2_access_key:
            return None  # R2 not configured — skip silently
        _client = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.r2_access_key,
            aws_secret_access_key=settings.r2_secret_key,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
    return _client

def upload_file(local_path: str, key: str) -> str | None:
    """Upload a file to R2. Returns public URL or None if R2 not configured."""
    client = get_client()
    if not client:
        return None
    try:
        client.upload_file(local_path, settings.r2_bucket, key)
        return f"r2://{settings.r2_bucket}/{key}"
    except ClientError as e:
        print(f"R2 upload error: {e}")
        return None

def upload_bytes(data: bytes, key: str, content_type: str = "application/octet-stream") -> str | None:
    """Upload bytes to R2."""
    client = get_client()
    if not client:
        return None
    try:
        client.put_object(
            Bucket=settings.r2_bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        return f"r2://{settings.r2_bucket}/{key}"
    except ClientError as e:
        print(f"R2 upload error: {e}")
        return None

def download_bytes(key: str) -> bytes | None:
    """Download file from R2 as bytes."""
    client = get_client()
    if not client:
        return None
    try:
        response = client.get_object(Bucket=settings.r2_bucket, Key=key)
        return response["Body"].read()
    except ClientError:
        return None

def delete_file(key: str) -> bool:
    """Delete a file from R2."""
    client = get_client()
    if not client:
        return False
    try:
        client.delete_object(Bucket=settings.r2_bucket, Key=key)
        return True
    except ClientError:
        return False

def list_files(prefix: str = "") -> list[str]:
    """List files in R2 bucket with given prefix."""
    client = get_client()
    if not client:
        return []
    try:
        response = client.list_objects_v2(Bucket=settings.r2_bucket, Prefix=prefix)
        return [obj["Key"] for obj in response.get("Contents", [])]
    except ClientError:
        return []

def backup_collection(collection_name: str, data: bytes) -> str | None:
    """Backup a Qdrant collection snapshot to R2."""
    timestamp = int(time.time())
    key = f"backups/collections/{collection_name}/{timestamp}.snapshot"
    return upload_bytes(data, key, "application/octet-stream")

def is_configured() -> bool:
    return bool(settings.r2_account_id and settings.r2_access_key and settings.r2_secret_key)
