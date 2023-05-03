FROM node:16.13.1

RUN apt-get update && apt-get install -y curl wget git zsh

RUN sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn
COPY . /app

EXPOSE 3000

CMD ["yarn", "start"]
