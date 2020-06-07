FROM node:13.3.0 AS builder
WORKDIR /app
EXPOSE 80
EXPOSE 443
RUN npm install -g yarn

COPY . .
RUN yarn install && yarn next build

FROM node:13.3.0-alpine AS final
WORKDIR /app
COPY --from=builder /app .

ENV NODE_ENV production

ENTRYPOINT ["yarn", "next", "start", "-p", "80"]
