FROM node:24-bookworm

ARG APP_USER=app_user
ARG APP_USER_GROUP=dev
ARG APP_USER_GROUP_ID=1337
ARG APP_USER_UID=1000

ENV DISPLAY=:1
ENV RESOLUTION=1920x1080

USER root
SHELL ["/bin/bash", "-c"]

# node:24-bookworm ships a built-in "node" user at uid/gid 1000, which
# collides with APP_USER_UID on most single-user Linux hosts (default first
# user is 1000) — remove it before creating our own user.
RUN userdel -r node

# Xvfb (display virtuel) + x11vnc (serveur VNC) + noVNC/websockify (visionneuse
# web) pour regarder Playwright tourner en mode headed depuis le host. Pas de
# bureau complet (LXDE/window manager) : Playwright n'en a pas besoin, un
# display suffit. Tous ces paquets sont de vrais .deb Debian, disponibles
# nativement en amd64 et arm64 (pas de stub snap comme chromium-browser).
# `sudo` doit être installé avant qu'on touche à /etc/sudoers ci-dessous,
# sinon dpkg trouve un conffile déjà modifié et plante (prompt non-interactif).
RUN apt-get update -qy && apt-get install -y \
    ca-certificates \
    curl \
    git \
    sudo \
    supervisor \
    xvfb \
    x11vnc \
    novnc \
    websockify \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid ${APP_USER_GROUP_ID} ${APP_USER_GROUP}; \
    useradd --uid ${APP_USER_UID} --shell=/bin/bash -p ! -g ${APP_USER_GROUP} --create-home ${APP_USER} && \
    echo "${APP_USER} ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Dépendances système de Chromium (fonts, libnss, libx11...), fournies par
# Playwright lui-même plutôt que maintenues à la main — couvre amd64/arm64
# identiquement. Le binaire du navigateur, lui, est installé plus tard via
# `npx playwright install chromium` (une fois package.json présent) pour
# matcher exactement la version de playwright utilisée par le projet.
RUN npx --yes playwright install-deps chromium

COPY supervisord.conf /etc/supervisor/supervisord.conf
COPY supervisor/ /etc/supervisor/conf.d/

RUN mkdir -p /var/log/vesper-front && chown -R ${APP_USER}:${APP_USER_GROUP} /var/log/vesper-front
RUN mkdir -p /data/front && chown -R ${APP_USER}:${APP_USER_GROUP} /data/front

# Vite dev server + noVNC (visionneuse web du display Xvfb)
EXPOSE 5173 6080

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
