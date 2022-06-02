# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).






## [Unreleased]



## [1.2.0] - 2021-10-15
### Added
- Add Okta Advanced Servers Access support
- Add server key option on `credentials.Server` instantiation
- Add `credentials.Server.fetchServerList()` static method

### Changed
- Maintenance updates

### Fixed
- Misc corrections in underlying shell commands



## [1.1.1] - 2021-05-04
### Fixed
- Actually use parameter (doh!)



## [1.1.0] - 2021-05-04
### Changed
- Write locally under `@absolunet-sparks/credentials` instead of CWD scope
- Maintenance updates



## [1.0.0] - 2021-04-19
### Added
- Add port option for database
- Add `credentials.Server.scopes`
- Add `server.scope`
- Add `server.database` setter
- Add `database.port`
- Add `credentials.Local.bitbucketOAuth2`
- Add `new credentials.Local()`
- Add `local.getCredentials()`
- Add `local.setCredentials()`
- Add LICENSE
- Add CHANGELOG.md

### Changed
- Provider migration from LastPass to OASA
- Receive database credentials instead of fetching it
- Errors are thrown instead of being directly outputted to the terminal
- Password handling for database
- Change `credentials.Server.find()` from async to sync
- Change `server.fetchCredentials()` from async to sync
- Change `database.setName()` to setter `database.name`
- Rename `server.hostname` to `server.host`
- Rename `server.runPromise()` to `server.runAsync()`
- Translate to English
- Migrate readme documentation to JSDoc
- Maintenance updates

### Removed
- Remove `credential.getCredentials()`
- Remove `credential.pokeGuardian()`
- Remove `credential.Database.types`
- Remove `credential.Database.users`
- Remove `credentials.Server.user`
- Remove `server.user`
- Remove `server.username`
- Remove `server.userLabel`
- Remove `server.fetchDatabaseCredentials()`
- Remove `database.type`
- Remove `database.user`
- Remove `database.name`
- Remove `database.confirmationLabel`
- Remove `database.fetchCredentials()`
- Remove `database.mysqlDoubleEscape()`



## [0.7.1] - 2020-03-15
### Changed
- Maintenance updates



## [0.7.0] - 2020-03-10
### Changed
- Convert validation to Joi
- Maintenance updates

### Fixed
- No prompt confirmation
- Remove double `ssh-add`



## [0.6.0] - 2020-01-10
### Added
- SSH tunnel for database connection

### Changed
- Maintenance updates



## [0.5.5] - 2019-12-09
### Changed
- Skip key if none in LastPass entry
- Maintenance updates



## [0.5.4] - 2019-09-04
### Changed
- Maintenance updates

### Fixed
- Show error message when no entry found



## [0.5.3] - 2019-05-28
### Fixed
- `scp` not using key



## [0.5.2] - 2019-04-17
### Fixed
- pem key registers for every call



## [0.5.1] - 2019-04-10
### Added
- `.connectionLabel` to identify Server



## [0.5.0] - 2019-04-04
### Changed
- Maintenance updates

### Fixed
- Double escape MySQL commands
- Support index '0' in find



## [0.4.0] - 2019-02-25
### Added
- Guardians

### Changed
- Maintenance updates



## [0.3.1] - 2019-02-19
### Fixed
- Better database name handling
- Support index '0' in find



## [0.3.0] - 2019-02-18
### Added
- Drilldown questionnaire

### Changed
- Update key pattern
- Use Symbol instead of String
- Maintenance updates



## [0.2.1] - 2019-02-05
### Fixed
- Bad dependency loaded



## [0.2.0] - 2019-02-05
### Added
- Username / Password getter
- Settle LastPass entry name

### Changed
- Maintenance updates



## [0.1.0] - 2019-01-31
### Added
- Initial






[Unreleased]: https://bitbucket.org/absolunet/node-sparks-credentials/compare/HEAD..1.2.0
[1.2.0]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/1.2.0..1.1.1
[1.1.1]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/1.1.1..1.1.0
[1.1.0]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/1.1.0..1.0.0
[1.0.0]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/1.0.0..0.7.1
[0.7.1]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.7.1..0.7.0
[0.7.0]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.7.0..0.6.0
[0.6.0]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.6.0..0.5.5
[0.5.5]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.5.5..0.5.4
[0.5.4]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.5.4..0.5.3
[0.5.3]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.5.3..0.5.2
[0.5.2]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.5.2..0.5.1
[0.5.1]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.5.1..0.5.0
[0.5.0]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.5.0..0.4.0
[0.4.0]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.4.0..0.3.1
[0.3.1]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.3.1..0.3.0
[0.3.0]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.3.0..0.2.1
[0.2.1]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.2.1..0.2.0
[0.2.0]:      https://bitbucket.org/absolunet/node-sparks-credentials/compare/0.2.0..0.1.0
[0.1.0]:      https://bitbucket.org/absolunet/node-sparks-credentials/src/0.1.0/
