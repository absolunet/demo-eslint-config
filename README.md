# Demo Repository - GitHub Actions

This code repository (or "repo") is designed to demonstrate the best GitHub has to offer with the least amount of noise.

## Folders

- Check [./github](./.github/) folder for workflows and automation examples.
- Two example of Node.js projects to test workflows automation:
  - `./eslint-config` - folder with a multi packages
  - `./node-tester` - folder with a mono packages
  - `./node-sparks-credientials` - folder with a mono packages asking for private access for `@absolunet-sparks`

## Notes Add.

- All tests has been disabled to gain minutes and now they return a message.
- All repo name has changed for @absolunet/demo-\*\*.
- `./eslint-config` has the latest @absolunet/manager version to run deploy command.

## Need TODO

- Remove from node-tester all test about `./.github/` and `bitbucket-pipelines.yml`.
- Maybe we could build and commit documentation in a workflow.
- To optimize, we could build an artifact for build steps, and then, run test with a matrix on that artifact
