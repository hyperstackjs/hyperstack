## Release

### No changelog release

Stage and state your changes:

```
$ pnpm changeset
```

Run through to publishing, removing any changelog:

```
$ pnpm run changeset version && pnpm kill-changelog && pnpm run changeset publish
```


## Docs

Documentation is written in Markdown, and built on a custom styled Docusaurus instance.

It is held [within the repo](docs/) in order to keep it co-located with code.

Deploying docs is done to netlify.
