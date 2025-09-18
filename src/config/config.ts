import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    db_username: string;
    db_password: string;
    db_host: string;
    db_port: number;
    db_name: string;
}

const config: Config = {
    port: Number(process.env.PORT) || 8080,
    db_username: process.env.DB_USERNAME || 'messaging_user',
    db_password: process.env.DB_PASSWORD || 'messaging_password',
    db_host: process.env.DB_HOST || 'localhost',
    db_port: Number(process.env.DB_PORT) || 5432,
    db_name: process.env.DB_NAME || 'messaging_service',
};

export default config;
