FROM --platform=linux/amd64 node:16.13.1

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn
COPY . /app

EXPOSE 3000

CMD ["yarn", "start"]
