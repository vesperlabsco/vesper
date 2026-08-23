.PHONY: install up down start stop status restart uninstall \
	log_back log_front log_db log_adminer log_smtp4dev \
	sh_back sh_front sh_db \
	back_lint back_format back_typecheck back_test \
	front_lint front_lint_fix front_format front_test front_build \
	migrate migration

.DEFAULT_GOAL := status

include ./docker/.env

DOCKER_SRC=./docker
DOCKER_COMPOSE_CMD=cd $(DOCKER_SRC) && docker compose -p vesper

CURRENT_UID := $(shell id -u)
CURRENT_GID := $(shell id -g)

RECREATE=false
VOLUMES=false
SUDO=false
TRUE=yes

# Build the images and start the stack. Also runs `uv sync` / `npm install`
# so that back/front dependencies are installed once pyproject.toml and
# package.json exist (see README note below).
install:
	$(DOCKER_COMPOSE_CMD) build --build-arg APP_USER_UID=$(CURRENT_UID) --build-arg APP_USER=$(APP_USER) --build-arg APP_USER_GROUP=$(APP_USER_GROUP)
ifeq (${RECREATE},${TRUE})
	$(DOCKER_COMPOSE_CMD) up --force-recreate -d
else
	$(DOCKER_COMPOSE_CMD) up -d
endif
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -e HOME=/home/$(APP_USER) back uv sync
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -e HOME=/home/$(APP_USER) front npm install
	$(DOCKER_COMPOSE_CMD) restart back front

up:
	$(DOCKER_COMPOSE_CMD) up -d

start:
	$(DOCKER_COMPOSE_CMD) start

status:
	$(DOCKER_COMPOSE_CMD) ps

stop:
	$(DOCKER_COMPOSE_CMD) stop

down:
	$(DOCKER_COMPOSE_CMD) down

restart:
	$(DOCKER_COMPOSE_CMD) restart

uninstall:
ifeq (${VOLUMES},${TRUE})
	$(DOCKER_COMPOSE_CMD) down -v
else
	$(DOCKER_COMPOSE_CMD) down
endif

log_back:
	$(DOCKER_COMPOSE_CMD) logs -f --tail=50 back

log_front:
	$(DOCKER_COMPOSE_CMD) logs -f --tail=50 front

log_db:
	$(DOCKER_COMPOSE_CMD) logs -f --tail=50 postgres_db

log_adminer:
	$(DOCKER_COMPOSE_CMD) logs -f --tail=50 adminer

log_smtp4dev:
	$(DOCKER_COMPOSE_CMD) logs -f --tail=50 smtp4dev

sh_back:
ifeq (${SUDO},${TRUE})
	$(DOCKER_COMPOSE_CMD) exec --user root back bash --login
else
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) back bash --login
endif

sh_front:
ifeq (${SUDO},${TRUE})
	$(DOCKER_COMPOSE_CMD) exec --user root front bash --login
else
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) front bash --login
endif

sh_db:
	$(DOCKER_COMPOSE_CMD) exec postgres_db bash --login

# --- Back (uv) ---

back_lint:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run task lint

back_format:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run task format

back_typecheck:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run task typecheck

back_test:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run task test

migrate:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run alembic upgrade head

# usage: make migration NAME="add users table"
migration:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run alembic revision --autogenerate -m "$(NAME)"

# --- Front (npm) ---

front_lint:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/front front npm run lint

front_lint_fix:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/front front npm run lint:fix

front_format:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/front front npm run format

front_test:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/front front npm run test

front_build:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/front front npm run build
