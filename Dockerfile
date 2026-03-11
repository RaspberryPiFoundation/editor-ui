FROM node:20.20.0

ENV TZ='Europe/London'
RUN apt-get update && apt-get install -y sudo curl wget vim git less zsh nodejs docker.io
RUN sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"

WORKDIR /app

COPY package.json yarn.lock ./
COPY . /app

RUN corepack enable \
  && yarn set version 4.12.0 \
  && echo "nodeLinker: node-modules\n\n$(cat /app/.yarnrc.yml)" > /app/.yarnrc.yml \
  && cat /app/.yarnrc.yml \
  && printf "Switched to Yarn version: "; yarn --version

RUN chsh -s $(which zsh) ${USER}

EXPOSE 3011

CMD ["yarn", "start"]
