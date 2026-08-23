import hashlib
import secrets


class SecurityCore:
    @staticmethod
    def generate_token() -> str:
        return secrets.token_hex(128)

    @staticmethod
    def generate_token_hash(token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    @staticmethod
    def verify_token(plain_token: str, stored_hash: str) -> bool:
        computed_hash = hashlib.sha256(plain_token.encode()).hexdigest()
        return secrets.compare_digest(computed_hash, stored_hash)
