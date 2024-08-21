FROM node:16.13.1

ENV TZ='Europe/London'
RUN apt-get update && apt-get install -y sudo curl wget vim git less zsh nodejs docker.io
RUN sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"

WORKDIR /app

COPY package.json yarn.lock ./
COPY . /app

RUN corepack enable \
  && corepack prepare yarn@stable --activate \
  && yarn set version 3.4.1 \
  && echo -e "nodeLinker: node-modules\n\n$(cat /app/.yarnrc.yml)" > /app/.yarnrc.yml \
  && cat /app/.yarnrc.yml \
  && printf "Switched to Yarn version: "; yarn --version

RUN yarn

EXPOSE 3010

CMD ["yarn", "start"]
