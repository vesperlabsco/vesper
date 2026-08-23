# Source: https://github.com/long2ice/fastapi-limiter
import inspect

from fastapi import Request, status
from pyrate_limiter import Duration, Limiter, Rate

from app.exceptions.base import AppHTTPException

# Limit applied per client (IP): 100 requests / minute
RATE = Rate(100, Duration.MINUTE)

# In-memory bucket (per process). No external infrastructure required.
_limiter = Limiter(RATE)


def _client_key(request: Request) -> str:
    client = request.client
    return client.host if client else "anonymous"


async def rate_limit(request: Request) -> None:
    result = _limiter.try_acquire(_client_key(request), blocking=False)
    acquired = await result if inspect.isawaitable(result) else result
    if not acquired:
        raise AppHTTPException(
            message="Too many requests",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            key="error.too_many_requests",
        )
