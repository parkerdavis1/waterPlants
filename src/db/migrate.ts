// import env from '$lib/env';
import { migrate } from 'drizzle-orm/libsql/migrator';
import config from '../../drizzle.config';
import db from '.';

await migrate(db, { migrationsFolder: config.out! });
