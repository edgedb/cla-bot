FROM node:13.3.0-buster-slim AS builder
WORKDIR /app
RUN npm install -g yarn

COPY . .
RUN yarn install && yarn next build

FROM node:13.3.0-buster-slim AS final

WORKDIR /app
COPY --from=builder /app .

ENV NODE_ENV production

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["yarn", "next", "start", "-p", "80"]
