FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

## Install Commitlint
RUN npm install -g @commitlint/cli@19 commitlint-config-gitmoji@2

## Install Commitizen
RUN npm install -g commitizen@4

## Install LeftHook
RUN curl -1sLf 'https://dl.cloudsmith.io/public/evilmartians/lefthook/setup.deb.sh' | sudo -E bash

RUN apt-get -y install --no-install-recommends \
    lefthook \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
