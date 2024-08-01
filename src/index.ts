import express, { Application } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import bodyParser from 'body-parser';
import xssClean from 'xss-clean';
import hpp from 'hpp';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import cluster from 'cluster';
import os from 'os';

// Import configuration and routes
import { secret } from './config/secret';
import rootRouter from './routes';
import { errorMiddleware } from './middlewares/errors';
import { corsOptions } from './config/corsOption';
import morganMiddleware from './middlewares/morgan';
import Logger, { errorLogger } from './config/logs';
import csrfProtection from './middlewares/csrf';
import { compressionMiddleware } from './middlewares/compression';
import { limiterMiddleware } from './middlewares/limiter';
import { sessionMiddleware } from './middlewares/session';

// Initialize authentication strategies
import './strategies/jwtStrategy';
import './strategies/googleStrategy';

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    // Master process
    Logger.info(`Master process is running on PID: ${process.pid}`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        Logger.error(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
        Logger.info('Starting a new worker');
        cluster.fork();
    });
} else {
    // Worker processes
    const app: Application = express();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Adjust this according to your CORS policy
            methods: ["GET", "POST"]
        }
    });

    // === Middleware ===

    // Security Middleware
    app.use(helmet());
    app.use(xssClean());
    app.use(hpp());

    // Compression Middleware
    app.use(compressionMiddleware);

    // CORS Middleware
    app.use(cors(corsOptions));

    // Request Logging Middleware
    app.use(morganMiddleware);
    app.use(expressWinston.logger({
        winstonInstance: Logger,
        statusLevels: true
    }));

    // Static File Serving Middleware
    app.use(express.static(path.join(__dirname, '../public')));

    // Body Parsing Middleware
    app.use(bodyParser.json({ limit: '1kb' }));
    app.use(bodyParser.urlencoded({ extended: false, limit: '1kb' }));
    app.use(cookieParser());

    // Rate Limiting Middleware
    app.use(limiterMiddleware);

    // Session Management Middleware
    app.use(sessionMiddleware);

    // Passport Middleware for Authentication
    app.use(passport.initialize());

    // CSRF Protection Middleware
    app.use(csrfProtection);

    // API Routes
    app.use('/api', rootRouter);

    // Error Logging Middleware
    app.use(expressWinston.errorLogger({
        winstonInstance: errorLogger,
    }));

    // Error Handling Middleware
    app.use(errorMiddleware);

    // === Socket.IO Handling ===

    io.on('connection', (socket) => {
        console.log('A user connected');

        // Handle custom events
        socket.on('message', (data) => {
            console.log('Message received:', data);
            // Echo the message back to the client
            socket.emit('message', data);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    // === Main Server Initialization ===

    httpServer.listen(Number(secret.SERVER_PORT), secret.HOST_NAME, () => {
        Logger.info(`Worker ${process.pid} running server at http://${secret.HOST_NAME}:${secret.SERVER_PORT}/`);
    });
}
