#################
## INFORMATION ##
#################

# Just by adding in .env a variable it will be automaticly override this value


from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENV: str = "development"

    # FASTAPI
    FASTAPI_PORT: int = 9000
    FASTAPI_HOST: str = "0.0.0.0"

    # Database
    DATABASE_MAIN_URL: str = "db"  # base value if not in ENV
    DATABASE_MAIN_NAME: str = "vesper"
    DATABASE_MAIN_USER: str = "app_user"
    DATABASE_MAIN_PASSWORD: str = "password"
    DATABASE_MAIN_ECHO: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# Instance globale à importer partout
settings = Settings()
