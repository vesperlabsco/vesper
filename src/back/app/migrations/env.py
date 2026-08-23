from logging.config import fileConfig
from alembic import context
from app.database import engine_sync

# Import model to create
from app.database import Base

# Importer TOUS les modèles pour qu'Alembic les détecte
# Importer TOUS les modèles pour qu'Alembic les détecte
# Importer TOUS les modèles pour qu'Alembic les détecte
# Importer TOUS les modèles pour qu'Alembic les détecte
# Import it from the ___init__.py from models or not depend about the architecture
#EXAMPLE :
# from app.models.main.salepoint import Salepoint
# from app.models.main.network_metric import NetworkMetric
# from app.models.main.network_status import NetworkStatus
# from app.models.main.global_status import GlobalStatus


# Alembic Config
config = context.config

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


config.set_main_option("sqlalchemy.url", str(engine_sync.url))

# Important for versions file generate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_sync

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
