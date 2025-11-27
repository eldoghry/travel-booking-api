import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as path from 'path';

const logDir = path.join(process.cwd(), 'logs'); // always resolves correctly inside Docker


const transports: winston.transport[] = [
    // Console Transport (development & debugging)
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('NestJS', { prettyPrint: true }),
        ),
    }),

    // Daily Rotate File Transports (for Filebeat ingestion)
    new DailyRotateFile({
        level: 'info',
        dirname: logDir,
        filename: 'info-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
    }),
    new DailyRotateFile({
        level: 'warn',
        dirname: logDir,
        filename: 'warn-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
    }),
    new DailyRotateFile({
        level: 'error',
        dirname: logDir,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
    }),
];


const WINSTON_CONFIG = {
    transports,
};

export default WINSTON_CONFIG;
