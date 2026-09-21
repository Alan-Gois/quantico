import pytest
from fastapi.testclient import TestClient
from backend.api.main import app

@pytest.mark.parametrize('origin', ['http://localhost:8001', 'http://127.0.0.1:8001'])
@pytest.mark.parametrize('protocol', ['bb84', 'mdi-qkd'])
def test_local_frontend_preflight(origin, protocol):
    response = TestClient(app).options(f'/simulate/{protocol}/stepbystep', headers={
        'Origin': origin, 'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'})
    assert response.status_code == 200
    assert response.headers['access-control-allow-origin'] == origin

def test_untrusted_origin_stays_rejected():
    response = TestClient(app).options('/simulate/bb84/stepbystep', headers={
        'Origin': 'https://untrusted.example', 'Access-Control-Request-Method': 'POST'})
    assert response.status_code == 400
    assert 'access-control-allow-origin' not in response.headers
