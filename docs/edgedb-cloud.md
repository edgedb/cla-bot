# Running in EdgeDB Cloud

This page describes the provided Dockerfile used to create an instance of the
`cla-bot` with [`edbcloud`](https://github.com/edgedb/cloud/).

## How application settings are handled

The image entrypoint runs `docker-entrypoint.py` which, using `boto3`, obtains
application settings stored as secrets, configure them as environmental
variables, and then replaces the current process with the `yarn` command that
starts the web application in production mode.

> TODO: a possible improvement is to handle application settings using `.env`
> files stored in [Amazon S3](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/taskdef-envfiles.html),
> and also to support environmental variables for docker images in `edbcloud` CLI

`docker-entrypoint.py` support secrets with a common prefix, to enable multiple
instances of the `CLA-bot` service within the same collection of secrets.
The default prefix of secrets is "CLABOT\_".

## Configuring secrets

`edbcloud` doesn't support, yet, configuring arbitrary secrets. Therefore,
specific application secrets need to be configured using the `aws` CLI.

Configure the secrets described in `Application settings` section at [[README]].

### Commands to handle secrets

List secrets:

```
aws secretsmanager list-secrets --region us-east-2
```

Get a secret by name:

```
aws secretsmanager get-secret-value --secret-id SECRET --region us-east-2
```

Creating a secret:

```
REGION=us-east-2

aws secretsmanager create-secret --region $REGION --name CLABOT_SERVER_URL \
    --description "CLA-Bot Root URL" \
    --secret-string "https://example.com"
```

Deleting a secret:

```
REGION=us-east-2

aws secretsmanager delete-secret --region $REGION --secret-id CLABOT_SERVER_URL
```

> TODO: bash script to configure all secrets with user-friendly input

## Building the image and creating an instance in EdgeDB Cloud

```
docker build -t cla-bot:12 .

docker tag cla-bot:12 ${USER_ID}.dkr.ecr.us-east-2.amazonaws.com/cla-bot:latest

docker push ${USER_ID}.dkr.ecr.us-east-2.amazonaws.com/cla-bot:latest

edbcloud fargate customer/cla -t1 -m2048 -c1024 --image-name=cla-bot --no-lb
```

**Missing points:**

- the Docker container starts the application properly, but the container is
  restarted every few minutes. This is probably caused by an ELB health check done
  on a port that is not handled by the web application

  > TODO: change health check configuration to hit an endpoint handled by the
  > service

- the instace of EdgeDB server used by the cla-bot must either be configured
  using a VPN, and/or password. To support passwords, it is necessary to prepare
  a docker image with a more recent version of EdgeDB (there are some
  complications to be handled)

- an SSL certificate and CNAME should be configured
