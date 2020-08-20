FROM node:13.3.0 AS builder
WORKDIR /app
EXPOSE 80
EXPOSE 443
RUN npm install -g yarn

COPY . .

RUN yarn install

# Temporary fix for edgedb package:
RUN FILE="node_modules/edgedb/dist/src/pool.d.ts" && \
  sed -i -E 's, } from "./ifaces";,\, onConnectionClose } from "./ifaces";,' $FILE && \
  sed -i -E 's,private \[holderAttr\];$,private [holderAttr];\r    [onConnectionClose](): void;\r,' $FILE

RUN yarn next build

FROM node:13.3.0-alpine AS final
WORKDIR /app
COPY --from=builder /app .

ENV NODE_ENV production

ENTRYPOINT ["yarn", "next", "start", "-p", "80"]
