//--------------------------------------------------------
//-- Helpers - Utils
//--------------------------------------------------------
'use strict';

const chalk        = require('chalk');
const { oasa }     = require('@absolunet/oasa-sdk');
const { terminal } = require('@absolunet/terminal');


const SCOPES = {
	client:   Symbol('client'),
	internal: Symbol('internal')
};

const ENVIRONMENTS = {
	demo:        Symbol('demo'),
	integration: Symbol('integration'),
	staging:     Symbol('staging'),
	production:  Symbol('production')
};

const TYPES = {
	web:       Symbol('web'),
	database:  Symbol('database')
};


const getSymbol = (list, value) => {
	return Object.values(list).find((item) => {
		return item.description === value.toLowerCase();
	});
};






class CredentialsHelpersUtil {

	get provider() {
		return oasa.name;
	}

	get scopes() {
		return SCOPES;
	}

	get environments() {
		return ENVIRONMENTS;
	}

	get types() {
		return TYPES;
	}

	get scopeLabels() {
		return {
			[this.scopes.client]:   'Client',
			[this.scopes.internal]: 'Internal'
		};
	}

	get environmentLabels() {
		return {
			[this.environments.demo]:        'Demo',
			[this.environments.integration]: 'Integration',
			[this.environments.staging]:     'Staging',
			[this.environments.production]:  'Production'
		};
	}

	get typeLabels() {
		return {
			[this.types.web]:      'Web',
			[this.types.database]: 'Database'
		};
	}


	get serverList() {
		return oasa.listServers();
	}


	// SCOPE-PROJECT-ENVIRONMENT-TYPE-INDEX
	getKey({ scope, project, environment, type, index }) {
		return `${scope.description}-${project}-${environment.description}-${type.description}-${index}`;
	}

	getKeyPattern({ scope, project = '[a-z\\d]+', environment, type, index = '\\d{2}' } = {}) {
		const scopePattern       = typeof scope       === 'symbol' ? scope.description       : '[a-z]+';
		const environmentPattern = typeof environment === 'symbol' ? environment.description : '[a-z]+';
		const typePattern        = typeof type        === 'symbol' ? type.description        : '[a-z]+';

		return new RegExp(`^${scopePattern}-${project}-${environmentPattern}-${typePattern}-${index}$`, 'u');
	}


	parseKey(key) {
		let [scope = '', project = '', environment = '', type = '', index = ''] = key.split('-');
		scope       = getSymbol(this.scopes, scope);
		project     = (/^[a-z0-9]+$/u).test(project) ? project : '';
		environment = getSymbol(this.environments, environment);
		type        = getSymbol(this.types, type);
		index       = (/^\d{2}$/u).test(index) ? index : '';

		return scope && project && environment && type && index ? { scope, project, environment, type, index } : undefined;
	}

	parseFromEntries(list) {
		const keys = [];
		list.forEach(({ hostname }) => {
			const key = this.parseKey(hostname);

			if (key) {
				keys.push(key);
			}
		});

		return keys;
	}


	ensureConnected() {
		if (!oasa.isEnrolled()) {
			throw new Error(`
				You are not connected to ${this.provider}
				Please run ${chalk.underline(oasa.enrollCommand)}
			`);
		}
	}


	fetchServer(key) {
		const servers = oasa.listServers();

		return servers.find(({ hostname }) => {
			return hostname === key;
		});
	}


	filterServers(pattern) {
		const servers = oasa.listServers();

		return servers.filter(({ hostname }) => {
			return pattern.test(hostname);
		});
	}


	fetchUser({ team }) {
		const accounts = oasa.listAccounts();

		return accounts.find(({ account }) => {
			return account === team;
		});
	}




	autoselect(message, value, show = true) {
		if (show) {
			terminal.echo(`${chalk.green('→')} ${chalk.bold(`Automatic selection ${message}:`)} ${chalk.cyan(value)}`);
		}
	}


	buildSymbolChoices(values, labels, secondaryLabels = {}) {
		const choices = [];
		values.forEach((value) => {
			choices.push({ name: `${labels[value]}${secondaryLabels[value] ? ` (${secondaryLabels[value]})` : ''}`, value });
		});

		return choices;
	}


	buildListChoices(values) {
		const choices = [];
		values.forEach((value) => {
			choices.push({ name: value, value });
		});

		return choices;
	}

}


module.exports = new CredentialsHelpersUtil();
