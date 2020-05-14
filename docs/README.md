# First time setup
The service requires:
* an instance of EdgeDB with a configured database
* a pull request web hook configured in the desired GitHub account
* a GitHub application configured with necessary rights
* a OAuth application to handle users' sign-in

## EdgeDB configuration

1. Connect to an instance of EdgeDB
2. Create a database called "cla"

```
create database cla;

\c cla
```

3. Execute the script provided in `migrations/structure.edgeql` file.

## GitHub app configuration
A GitHub app to interact with PR statuses and comments must be configured under account `Settings > Developer settings` with the following permissions:

* Commit statuses `Read & write`
* Pull requests `Read & write`
and required metadata (automatically set by GitHub UI).

Then, a private RSA key must be downloaded to be used by this service.
Currently, the private RSA key is read from file system, and its path is configured in the `.env` file at the application root, with key `GITHUB_RSA_PRIVATE_KEY`.

## OAuth app configuration
A OAuth application is used to enable sign-in for contributors and administrators.
_TODO: document how to create the OAuth app registration._

## GitHub integration requires public endpoints
During local development, it's recommended to use [`ngrok`](https://ngrok.com/) to create a tunnel and use public endpoints provided by this tool. This is also recommended by GitHub. If a paid license is available, it's possible to use a fixed DNS name, which is convenient to configure only once the redirect URI for the OAuth application, the web hook for pull requests, and `SERVER_URL` application setting.

## Notes for developers
The file `GitHub.md` contains examples of payloads handled by GitHub API.

## Useful links

* https://www.npmjs.com/package/client-oauth2
* https://www.npmjs.com/package/client-oauth2#authorization-code-grant
