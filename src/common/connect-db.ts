import { connect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import log from 'loglevel';

export async function connectDatabase(mongoUri: string) {
    await connect(mongoUri);
    log.info('Database Connected!');
}
