# Notes for developers
The file `GitHub.md` contains examples of payloads handled by GitHub API.

## GitHub app configuration
A GitHub app to interact with PR statuses and comments must be configured under account `Settings > Developer settings` with the following permissions:

* Commit statuses `Read & write`
* Pull requests `Read & write`
and required metadata (automatically set by GitHub UI).

Then, a private RSA key must be downloaded to be used by this service.
Currently, the private RSA key is read from file system, and its path is configured in the `.env` file at the application root.

Later, the private RSA key might be stored in a Cloud based HSM solution and fetched from there, to improve security.

## Requirements
This application has been developed to address these needs:

1. when someone tries to do a PR,
2. check by username or user ID if the person signed the configured CLA
3. if not, publish a failure status in the PR and challenge with the agreement to be signed (ask for it), with a link to a page where the license is displayed
4. if yes, update the existing status to set it to succeeded, and return "OK"
5. the interface is simple: it shows the agreement and the button to accept / reject (requiring OAuth integration to verify user's identity)
