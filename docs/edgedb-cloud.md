# Running in EdgeDB Cloud

This page describes how to create an instance of the
`cla-bot` with [`edbcloud`](https://github.com/edgedb/cloud/).

## How application settings are handled

The image entrypoint runs `docker-entrypoint.py` which, using `boto3`, obtains
application settings stored as secrets, configures them as environmental
variables, and then replaces the current process with the `yarn` command that
starts the web application in production mode.

> TODO: a possible improvement is to handle application settings using `.env`
> files stored in [Amazon S3](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/taskdef-envfiles.html)

`docker-entrypoint.py` support secrets with a common prefix, to enable multiple
instances of the `CLA-bot` service within the same collection of secrets.
The default prefix of secrets is "CLABOT\_".

## Configuring secrets

Prepare required services and a `.env` file as described in the [README](./README.md).
The `SERVER_URL` setting inside the `.env` file can only be configured in a
second moment, after the load balancer in edbcloud, and eventually a custom
domain name, are configured.

Copy the `.env` file inside the `scripts` folder at the root of the `cla-bot`
repository, then use the provided `clabot-secrets.sh` script to upload secrets
to the remote secrets manager. `edbcloud` doesn't support, yet, configuring
arbitrary secrets. Therefore, specific application secrets need to be
configured using the `aws` CLI.

Script reference:

| Action                                                           | Command                                   |
| ---------------------------------------------------------------- | ----------------------------------------- |
| Validate secrets                                                 | ./clabot-secrets.sh                       |
| Create new secrets (fails if variables with the same name exist) | PUSH=1 ./clabot-secrets.sh                |
| Schedule the deletion of previously configured secrets           | DELETE=1 ./clabot-secrets.sh              |
| Updates existing secrets                                         | UPDATE=1 PUSH=1 ./clabot-secrets.sh       |
| Use a custom prefix                                              | PREFIX=CLABOT2_ [...] ./clabot-secrets.sh |

---

**Note**: the private RSA key of the GitHub application can be copy pasted in
the `scripts` folder, then its name configured as `GITHUB_RSA_PRIVATE_KEY`
variable as in the provided example.

## Create an app service in edbcloud

Use the instructions described in the
[cloud repository](https://github.com/edgedb/cloud/blob/master/mvp/README.md)
to use the `edbcloud` CLI and create a desired service.

Either create a new customer, or select an existing one to run an instance of
the service. The instructions below describe how to create an instance of the
application service, they don't describe the configuration of a new RDS
instance (which are already described in the `cloud` repository).

```bash
CUSTOMER=example
INSTANCE=cla
INSTANCE_FULL_NAME=$CUSTOMER/$INSTANCE_NAME

# create a load balancer
edbcloud lb --add $INSTANCE_FULL_NAME \
  -H \
  --target-port 80 \
  --listener-port 80 \
  --health-check-path "/api/health"
```

While the load balancer is being provisioned, obtain the domain name assigned
to it:

```bash
edbcloud lb
```

For example: `edbcloud-customer-instance-152377629.us-east-2.elb.amazonaws.com`.
Either configure a CNAME for this domain, or configure this value directly as
`SERVER_URL` in the `.env` settings, including scheme.

```
SERVER_URL=http://edbcloud-customer-instance-152377629.us-east-2.elb.amazonaws.com
```

Now that the `SERVER_URL` is known, it is possible to build the Docker image
that will be used for the CLA-Bot application server.

## Building the Docker image

```bash
REVISION=1

docker build -t cla-bot:$REVISION .
```

> These steps require `Docker`

## Pushing the Docker image to the remote repository

Login to the remote AWS ECR service:

```bash
ACCOUNT_ID=0000000000000
REGION=us-east-2

aws ecr get-login-password --region $REGION | docker login \
  --username AWS \
  --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
```

> This step require the `AWS` CLI.

**Note:** AWS account id can be found [here](https://console.aws.amazon.com/iam/home?#/security_credentials?credentials=iam).

```bash
docker tag cla-bot:$REVISION $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/cla-bot:$REVISION

docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/cla-bot:$REVISION
```

## Create an instance of the application server

Ensure that the load balancer is now available:

```bash
edbcloud lb
```

Once the load balancer is available, create an instance of the service using
this command:

```bash
edbcloud fargate $INSTANCE_FULL_NAME \
  -t1 \
  -m2048 \
  -c1024 \
  --image-name=cla-bot \
  --image-revision=$REVISION \
  --container-port 80
```

---

### Missing features

- the instace of EdgeDB server used by the cla-bot must either be configured
  to require a password. To support passwords, it is necessary to prepare
  a docker image with a more recent version of EdgeDB (there are some
  complications to be handled)

- an SSL certificate and CNAME should be configured

### Useful commands for AWS ECR

To list the existing ECR repositories:

```bash
aws ecr describe-repositories --registry-id $ACCOUNT_ID  --region $REGION
```

To create a new repository (optional, these instructions use the existing
repository called "cla-bot"):

```bash
aws ecr create-repository --repository-name desired-name --region $REGION
```
