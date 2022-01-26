FROM node:14.16-buster-slim AS builder
WORKDIR /app

COPY . .

# Big packages cause false network connectivity alarms: https://github.com/yarnpkg/yarn/issues/4890
RUN yarn install --network-timeout 1000000

RUN yarn next build

FROM edgedb/edgedb-cli:linux-x86_64-latest AS edgedbcli

FROM node:14.16-buster-slim AS final
WORKDIR /app
COPY --from=builder /app .
COPY --from=edgedbcli /usr/bin/edgedb /usr/bin/edgedb

RUN set -ex; export DEBIAN_FRONTEND=noninteractive; \
  apt-get update && \
  apt-get install -y --no-install-recommends \
  python3 python3-pip && \
  pip3 --no-cache-dir install boto3

ENV NODE_ENV production
ENV CUSTOMER nobody
ENV REGION us-east-2
ENV SECRETS_PREFIX CLABOT_

EXPOSE 80
EXPOSE 443


COPY docker-entrypoint.py /home/
ENTRYPOINT ["/usr/bin/python3", "-u", "/home/docker-entrypoint.py"]
