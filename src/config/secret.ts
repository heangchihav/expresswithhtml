import dotenv from 'dotenv'

dotenv.config();

 const NODE_ENV = process.env.NODE_ENV || 'development';
 const SERVER_PORT = process.env.SERVER_PORT || 3000;
 const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dummy access token";
 const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "dummy access token";
 const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
 const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
 const HOST_NAME = process.env.HOST_NAME || '127.0.0.1'
 const CALL_BACK_URL = process.env.CALL_BACK || `http://${HOST_NAME}:${SERVER_PORT}/api/auth/google/callback`
 const SESSION_SECRET = process.env.SESSION_SECRET || "dummy secretKey";

export const secret = {
    NODE_ENV,
    SERVER_PORT,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    HOST_NAME,
    CALL_BACK_URL,
    SESSION_SECRET
}