FROM python:3.14-trixie

ARG APP_USER=app_user
ARG APP_USER_GROUP=dev
ARG APP_USER_GROUP_ID=1337
ARG APP_USER_UID=1000

# Create dev user matching the host UID so files written from the container
# (uv.lock, .venv, __pycache__...) stay owned by the host user.
RUN groupadd --gid ${APP_USER_GROUP_ID} ${APP_USER_GROUP}; \
    useradd --non-unique --uid ${APP_USER_UID} --shell=/bin/bash -p ! -g ${APP_USER_GROUP} --create-home ${APP_USER} && \
    echo "${APP_USER} ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

USER ${APP_USER}
# UID 0 is shared with root (see useradd --non-unique above) for CI builds
# run as root; without an explicit HOME, getpwuid(0) resolves to root's
# passwd entry instead of app_user's, sending the uv install to /root
# instead of here.
ENV HOME="/home/${APP_USER}"
WORKDIR ${HOME}

# Install UV
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/home/${APP_USER}/.local/bin:$PATH"

EXPOSE 8000
