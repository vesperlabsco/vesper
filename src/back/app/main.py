from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.exception_handlers import register_exception_handlers
from app.core.logger import logger
from app.core.security.rate_limiter import rate_limit
from app.core.security.secure_headers import (
    DocsExemptSecureASGIMiddleware,
    secure_headers,
)
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run when app start
    logger.info("Starting FastAPI app...", extra={"context": "lifespan"})
    await init_db()
    yield
    # Run when app shutdown
    logger.warning("Shutting down app...", extra={"context": "lifespan"})


app = FastAPI(lifespan=lifespan, dependencies=[Depends(rate_limit)])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers (helmet-style). Swagger/ReDoc are exempt: BASIC CSP
# blocks the CDN scripts FastAPI /docs loads.
app.add_middleware(DocsExemptSecureASGIMiddleware, secure=secure_headers)

register_exception_handlers(app)

v1_router = APIRouter(prefix="/api/v1")


@v1_router.get("/health")
def ping():
    return {"server": "ok"}


# Private
# v1_router.include_router(private_router.router)

app.include_router(v1_router)


# Run the app
if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    from app.config.settings import settings

    uvicorn.run(
        "app.main:app",
        host=settings.FASTAPI_HOST,
        port=settings.FASTAPI_PORT,
        reload=settings.ENV == "development",
        server_header=False,
        date_header=False,
    )
