from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_returns_ok_status() -> None:
    # No `with` block: this route doesn't depend on anything set up by the
    # lifespan, so skip triggering it (avoids a real DB connection attempt
    # via init_db() — see app/database.py).
    client = TestClient(app)

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"server": "ok"}
