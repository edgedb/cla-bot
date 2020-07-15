# First time setup

The service requires:

- an instance of EdgeDB with a configured database
- a pull request web hook configured in the desired GitHub account
- a GitHub application configured with necessary rights
- a OAuth application to handle users' sign-in

To configure an instance hosted in EdgeDB Cloud, see also [[edgedb-cloud]].

## EdgeDB configuration

1. Connect to an instance of EdgeDB
2. Create a database called "cla"

```
create database cla;

\c cla
```

3. Execute the script provided in `migrations/structure.edgeql` file.

> TODO: apply the migration when bootstrapping the application in the
> Dockerfile entrypoint.

Configure a user's password as desired.

## Configuring the PR web hook

Create an [organization webhook](https://developer.github.com/v3/orgs/hooks/)
to notify the CLA-bot service of pull request events.

Configure the payload URL to match this pattern:
`https://{INSTANCE_DOMAIN}/api/pullrequesthook`.
Select the radio button _Let me select individual events._, and check
_Pull requests_ events. Ensure that the webhook is active.

## GitHub app configuration

A GitHub app to interact with PR statuses and comments must be configured
under account `Settings > Developer settings` with the following permissions:

- Commit statuses `Read & write`
- Pull requests `Read & write`
  and required metadata (automatically set by GitHub UI).

Then, a private RSA key must be downloaded to be used by this service.
Currently, the private RSA key is read from file system, and its path is
configured as environmental variable `GITHUB_RSA_PRIVATE_KEY`. The provided
Docker image reads the PEM stored as secret in `docker-entrypoint.py`, and
writes it to local file system when bootstrapping the application.

## OAuth app configuration

A OAuth application is used to enable sign-in for contributors and
administrators. A new OAuth application can be configured under
GitHub account settings > Developer settings > OAuth Apps.

The application is assigned automatically a Client ID and Client Secret. These
values are used by the web service to implement OAuth flows.

_Homepage URL_ should be configured to a company page that describes
the owner of the OAuth application. However, this value is irrelevant
for the CLA-bot service.

_Authorization callback URL_ must be configured to the root URL where the
CLA-Bot service will be served. It is important to configure this value as
the root of the web application because the same OAuth app is used at different
paths, to implement sign-in of both administrators and contributors.
For example, if an OAuth application is configured for local development, its
authorization callback URL could be _http://localhost:3000/_.

Configure an application logo as desired.

## Application settings

The following table describes the application settings required by the service.
These can be either configured as environmental variables, or `.env` file at
the application root folder.

| Name                            | Description                                                             | Example value         |
| ------------------------------- | ----------------------------------------------------------------------- | --------------------- |
| EDGEDB_HOST                     | EdgeDB host                                                             | 127.0.0.1             |
| EDGEDB_USER                     | EdgeDB user                                                             | edgedb                |
| EDGEDB_PASSWORD                 | EdgeDB password                                                         | \*\*\*\*\*\*\*\*      |
| GITHUB_APPLICATION_ID           | GitHub application id                                                   | 12327                 |
| GITHUB_RSA_PRIVATE_KEY          | File path to the private RSA key of the GitHub application              | example.pem           |
| GITHUB_OAUTH_APPLICATION_ID     | Id of the OAuth application used for users' sign-in                     | 30cd618b8740eb66a95c  |
| GITHUB_OAUTH_APPLICATION_SECRET | Secret of the OAuth application used for users' sign-in                 | 12310928301920asd9123 |
| SERVER_URL                      | URL to the root of the web service itself, this is used for OAuth flows | https://myorg-cla.com |
| SECRET                          | Secret used to generate and validate JWTs issued by the web service     | https://myorg-cla.com |
| ORGANIZATION_NAME               | Name of the organization                                                | edgedb                |

## GitHub webhooks require public endpoints

During local development, it is recommended to use [`ngrok`](https://ngrok.com/)
to create a tunnel and use public endpoints provided by this tool. This tool
is also recommended by GitHub. If a paid license is available, it's possible
to use a fixed DNS name, which is convenient to configure only once the
redirect URI for the OAuth application, the web hook for pull requests,
and `SERVER_URL` application setting.

For example, if a subdomain `rp-edgedb` is reserved with ngrok, run ngrok with
this command:

```
ngrok http 3000 -subdomain=rp-edgedb
```

In such scenario, the GitHub web hook would be configured with this value:

- `https://rp-edgedb.ngrok.io/api/pullrequesthook`

While the OAuth authorization URL can still use localhost to enable faster
development (using a tunnel to serve the application in development mode
increases latencies).

## Useful links

- https://www.npmjs.com/package/client-oauth2
- https://www.npmjs.com/package/client-oauth2#authorization-code-grant
