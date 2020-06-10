FROM node:13.3.0 AS builder
WORKDIR /app
RUN npm install -g yarn

COPY . .
RUN yarn install && yarn next build

FROM node:13.3.0 AS final

RUN set -ex; export DEBIAN_FRONTEND=noninteractive; \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 python3-pip && \
    pip3 --no-cache-dir install boto3

WORKDIR /app
COPY --from=builder /app .

ENV NODE_ENV production
ENV CUSTOMER nobody
ENV REGION us-east-2
ENV SERVER_URL https://example.foo.io
ENV ORGANIZATION_NAME githuborg

EXPOSE 80
EXPOSE 443

COPY docker-entrypoint.py /home/
ENTRYPOINT ["/usr/bin/python3", "-u", "/home/docker-entrypoint.py"]
