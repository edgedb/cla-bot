# Notes for developers
The file `GitHub.md` contains examples of payloads handled by GitHub API.

## Requirements
This application has been developed to cover address these needs:

1. when someone tries to do a PR,
2. check by username if the person signed the configured CLA
3. if not, challenge with the agreement to be signed (ask for it), with a link to a page where the license is dispalyed
4. if yes, return "OK"
5. the interface is simple: just show the agreement and the button to accept / reject (but requiring OAuth integration to verify user's identity)

----
Use OAuth integration to interact with EdgeDB.
