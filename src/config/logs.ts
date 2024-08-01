import winston from 'winston';
import { secret } from './secret';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

const level = () => {
    return secret.NODE_ENV === 'development' ? 'debug' : 'warn'
}

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}
winston.addColors(colors)

const myFormat = winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,

)
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.errors({ stack: true }),
    winston.format.cli(),
    myFormat
)

const transports = [
    new winston.transports.Console(),
]

const Logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
    defaultMeta: { service: 'user-service' }
})

export default Logger;

export const errorLogger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
    ],
    format: format
})