from typing import Any

from secure import Preset, Secure
from secure.middleware import SecureASGIMiddleware

DOCS_PATHS = frozenset(
    {
        "/docs",
        "/docs/",
        "/redoc",
        "/redoc/",
        "/openapi.json",
        "/docs/oauth2-redirect",
    }
)

secure_headers = Secure.from_preset(Preset.BASIC)


class DocsExemptSecureASGIMiddleware:
    """Apply helmet-style headers on API responses, not on Swagger/ReDoc pages.

    Preset.BASIC CSP blocks cdn.jsdelivr.net and inline scripts, which FastAPI
    /docs needs. It also sends upgrade-insecure-requests, which breaks HTTP.
    """

    def __init__(self, app: Any, *, secure: Secure | None = None) -> None:
        self.app = app
        self._secure_middleware = SecureASGIMiddleware(
            app, secure=secure or secure_headers
        )

    async def __call__(self, scope: dict[str, Any], receive: Any, send: Any) -> None:
        if scope.get("type") == "http" and scope.get("path") in DOCS_PATHS:
            await self.app(scope, receive, send)
            return
        await self._secure_middleware(scope, receive, send)
