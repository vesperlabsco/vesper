.PHONY: install up down start stop status restart uninstall \
	log_back log_front log_db log_adminer log_smtp4dev \
	sh_back sh_front sh_db \
	back_install back_lint back_format back_typecheck back_test back_teardown \
	front_install front_lint front_lint_fix front_format front_test front_build front_e2e front_e2e_ui front_teardown \
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
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -e HOME=/home/$(APP_USER) -w /data/front front npx playwright install chromium
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

# Build & start only the back service, then uv sync.
# Scoped alternative to `install` for back-only contexts (e.g. CI) — doesn't
# touch front/postgres_db. `--no-deps` overrides `depends_on: postgres_db`:
# safe since app/database.py's init_db() catches the connection error instead
# of crashing (see app/main.py lifespan), and the test suite is unit-only, no
# real DB integration. Revisit once integration tests need a live database.
back_install:
	$(DOCKER_COMPOSE_CMD) build --build-arg APP_USER_UID=$(CURRENT_UID) --build-arg APP_USER=$(APP_USER) --build-arg APP_USER_GROUP=$(APP_USER_GROUP) back
	$(DOCKER_COMPOSE_CMD) up -d --no-deps back
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -e HOME=/home/$(APP_USER) back uv sync

back_lint:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run task lint

back_format:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run task format

back_typecheck:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run task typecheck

back_test:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run task test

# Full cleanup for disk-constrained self-hosted runners, scoped to exactly
# what back_install started (back only) — never touches front's or
# postgres_db's container, image or volume. `down` has no per-service form,
# hence the explicit stop/rm/rmi instead.
back_teardown:
	$(DOCKER_COMPOSE_CMD) stop back
	$(DOCKER_COMPOSE_CMD) rm -f back
	docker rmi vesper-back || true

migrate:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run alembic upgrade head

# usage: make migration NAME="add users table"
migration:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/back back uv run alembic revision --autogenerate -m "$(NAME)"

# --- Front (npm) ---

# Build & start only the front service, then npm install + playwright chromium.
# Scoped alternative to `install` for front-only contexts (e.g. CI) — doesn't
# touch back/postgres_db. `--no-deps` overrides the `depends_on: back` in
# docker-compose.yml: safe today since front doesn't call the API yet (no
# AuthProvider/backend calls wired up, see front CLAUDE.md) — revisit once it does.
front_install:
	$(DOCKER_COMPOSE_CMD) build --build-arg APP_USER_UID=$(CURRENT_UID) --build-arg APP_USER=$(APP_USER) --build-arg APP_USER_GROUP=$(APP_USER_GROUP) front
	$(DOCKER_COMPOSE_CMD) up -d --no-deps front
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -e HOME=/home/$(APP_USER) -w /data/front front npm install
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -e HOME=/home/$(APP_USER) -w /data/front front npx playwright install chromium
	$(DOCKER_COMPOSE_CMD) restart front

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

front_e2e:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/front front npm run e2e

front_e2e_ui:
	$(DOCKER_COMPOSE_CMD) exec --user $(CURRENT_UID) -w /data/front front npm run e2e:ui

# Full cleanup for disk-constrained self-hosted runners, scoped to exactly
# what front_install started (front only) — never touches back's or
# postgres_db's container, image or volume. See back_teardown.
front_teardown:
	$(DOCKER_COMPOSE_CMD) stop front
	$(DOCKER_COMPOSE_CMD) rm -f front
	docker rmi vesper-front || true
