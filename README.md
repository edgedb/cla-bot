# cla-bot

A GitHub bot and Web UI for managing contributor license agreements.

## Development

**Requirements:**

- Node.js v13.3.0
- yarn (install with `npm install -g yarn`)

A full setup requires also:

- a configured OAuth application in GitHub
- a configured GitHub application in GitHub
- an EdgeDB instance configured with schema from `dbschema/`
- `.env` file populated with proper application settings
- a web hook for pull requests

For more information on this first-time configuration, refer to the
documentation in the project Wiki, at
[Configuration](https://github.com/edgedb/cla-bot/wiki/Configuration).

### Getting started:

```bash
# install dependencies
yarn install

# run the development server
yarn next
```

## Project structure

This project uses onion architecture, with the following namespaces:

- `constants` contains configuration constants
- `components` contains reusable React components
- `pages` is a folder handled by `Next.js`, with routes: pages and api
- `pages-common` is a folder containing common code for pages and api used in
  `Next.js` front-end
- `public` is a folder handled by `Next.js`, containing static files
- `service.domain` contains domain objects and interfaces for external services
- `service.data` contains concrete implementations of external services
- `service.handlers` contains business logic

Business logic is lousy coupled with the data access layer, since it is only
aware of interfaces, not concrete implementations of DAL logic. Everything
inside the `service` folder is abstracted from `Next.js` and should be
reusable with other web frameworks, unmodified.

## Documentation

For documentation, refer to the [project Wiki](https://github.com/edgedb/cla-bot/wiki).
