"""Centralized exception handlers and standard error response format."""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

from app.core.logger import logger
from app.exceptions.base import AppException, AppHTTPException


def log_exception_error(request: Request, message: str, status_code: int) -> None:
    logger.error(
        f"{request.method}-{ request.url.path}: Status: {status_code}, message: {message}"
    )


def error_body(message: str, key: str | None = None) -> dict:
    """Standard error response body: success=False, message, key."""
    body: dict = {"success": False, "message": message}
    if key is not None:
        body["key"] = key
    return body


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    log_exception_error(request, exc.message, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content=error_body(exc.message, exc.key),
    )


async def app_http_exception_handler(
    request: Request, exc: AppHTTPException
) -> JSONResponse:
    log_exception_error(request, exc.message, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content=error_body(exc.message, exc.key),
    )


async def fastapi_http_exception_handler(
    request: Request, exc: HTTPException
) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, dict):
        message = detail.get("msg", detail.get("message", str(detail)))
        key = detail.get("key")
    else:
        message = str(detail)
        key = None
    log_exception_error(request, message, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content=error_body(message, key),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register exception handlers on the FastAPI application."""
    app.add_exception_handler(AppException, app_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(AppHTTPException, app_http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(HTTPException, fastapi_http_exception_handler)  # type: ignore[arg-type]
