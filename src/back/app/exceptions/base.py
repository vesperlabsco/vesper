class AppException(Exception):
    """Base exception for all custom application exceptions."""

    def __init__(
        self, message: str | None = None, key: str | None = None, status_code: int = 400
    ):
        self.message = message or "An error occurred"
        self.key = key  # Translation key (e.g. error.invalid_credentials)
        self.status_code = status_code
        super().__init__(self.message)


class AppHTTPException(AppException):
    """
    Exception for API errors with standardized format.

    Returns: { "success": false, "message": "...", "key": "translation.key" }
    """

    def __init__(
        self,
        message: str,
        status_code: int = 400,
        key: str | None = None,
    ):
        super().__init__(message=message, key=key, status_code=status_code)
