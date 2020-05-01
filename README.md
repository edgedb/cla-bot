# cla-bot
A GitHub bot and Web UI for managing contributor license agreements.

## Development

**Requirements:**
* Node.js v13.3.0
* yarn (install with `npm install -g yarn`)

Getting started:

```bash
# install dependencies

yarn install

# run the development server

yarn next
```

## Project structure
This project uses onion architecture, with the following namespaces:

* `constants` contains configuration constants
* `pages` is a folder handled by `Next.js`, with routes
* `public` is a folder handled by `Next.js`, containing static files
* `service.domain` contains domain objects and interfaces for external services
* `service.data` contains concrete implementations of external services
* `service.handlers` contains business logic
* `notes` folder contains documentation for developers

Business logic is lousy coupled with the data access layer, since it is only aware of interfaces, not concrete implementations of DAL logic. Everything inside the `service` folder is abstracted from `Next.js` and should be reusable with other front-ends, unmodified.

## GitHub integration
See the `notes` folder for examples and more information on the GitHub integration. Relevant functions in the code are commented to describe non obvious dynamics of the GitHub API. The folder includes a [Postman](https://www.postman.com) collection with some of the web requests used by this application.
