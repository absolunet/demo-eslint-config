# @absolunet-sparks/credentials

> AbsoSparks Credentials

Connects to [Okta Advanced Server Access](https://www.okta.com/products/advanced-server-access/) via [sft](https://help.okta.com/en/prod/Content/Topics/Adv_Server_Access/docs/client.htm) to fetch credentials.


## Install

```sh
$ npm install @absolunet-sparks/credentials
```


## Usage

### Server
```js
import credentials from '@absolunet-sparks/credentials';

const server = new credentials.Server({
	scope:       credentials.Server.scope.client,
	project:     'bigclient',
	environment: credentials.Server.environments.integration
}).fetchCredentials();

// Execute stuff
const list = server.runAndRead('ls -al');

server.run('composer install');

// OR spawn a server shell to let the user do what it wants
server.spawnShell();
```

For a specific server name, use this syntax:
```js
const server = new credentials.Server('bigclient').fetchCredentials();
```

### Database
```js
server.database = new credentials.Database({
	username: 'scott',
	password: 'tiger'
});

const tables = server.runAndRead(`${server.database.mysql} --execute "SELECT * FROM my_table;"`);

await server.runAsync(`${server.database.mysql} --execute "UPDATE my_table SET password='rainbow';"`, { ignoreError: credentials.Server.REGEXP_MYSQL_SERVER });
```

### Local
```js
const bitbucketOAuth2 = new credentials.Local(credentials.Local.bitbucketOAuth2);

// Write them locally
bitbucketOAuth2.setCredentials({
	consumerKey:    'zyxwvutsrqponmlkji',
	consumerSecret: 'abcdefghijklmnopqrstuvwxyz012345'
});

// Read them later
const credentials = bitbucketOAuth2.getCredentials();
```

## Documentation

See the [Changelog](CHANGELOG.md) to see what has changed.


## License

[Copyright](LICENSE) © [Absolunet inc.](https://absolunet.com) or its affiliates. All rights reserved.
