import { User } from "@prisma/client";
import express from "express";

declare global {
    namespace Express {
        export interface Request {
            user: User;
        };
        export interface AuthInfo {
            accessToken?: string;
            refreshToken?: string;
        }
    }
};