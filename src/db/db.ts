import { Pool } from 'pg';
import config from '../config/config.ts';

const pool = new Pool({
    user: config.db_username,
    host: config.db_host,
    database: config.db_name,
    password: config.db_password,
    port: config.db_port,
});

export default pool;
