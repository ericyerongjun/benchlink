"""File parsing utility for BOM uploads."""
import mimetypes
import logging

logger = logging.getLogger(__name__)

ALLOWED_MIMETYPES = {
    "text/csv",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/pdf",
    "text/tab-separated-values",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_file(content_type: str | None, file_size: int) -> tuple[bool, str | None]:
    """Validate uploaded file type and size."""
    if file_size > MAX_FILE_SIZE:
        return False, f"File too large. Max {MAX_FILE_SIZE // (1024 * 1024)} MB."

    if content_type and content_type not in ALLOWED_MIMETYPES:
        logger.warning("Unrecognized MIME type: %s (allowed anyway for dev)", content_type)

    return True, None


def detect_mime(filename: str) -> str:
    mime, _ = mimetypes.guess_type(filename)
    return mime or "application/octet-stream"
