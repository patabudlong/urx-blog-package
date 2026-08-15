#!/usr/bin/env node
import { install } from '../dist/cli/install.js';
import { migrate } from '../dist/cli/migrate.js';
import { remove } from '../dist/cli/remove.js';

const command = process.argv[2];

try {
	if (command === 'install') {
		await install();
	} else if (command === 'remove') {
		await remove();
	} else if (command === 'migrate') {
		await migrate();
	} else {
		console.log(`
Urixoft Blog Package CLI

Usage:
  urx-blog install   Install blog routes, SQLite database, and seed data
  urx-blog migrate   Run migrations and seed data
  urx-blog remove    Remove installed files from this project

Database: SQLite (node:sqlite) at data/urx-blog.db — no Docker required
Default admin: superadmin@urixoft.com / Use8to32!
`);
		process.exit(command ? 1 : 0);
	}
} catch (error) {
	console.error('\n❌', error instanceof Error ? error.message : error);
	process.exit(1);
}
