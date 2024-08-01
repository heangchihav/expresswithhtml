import { Request, Response } from "express";
import prisma from "../libs/client";
import { secret } from "../config/secret";
import jwt from 'jsonwebtoken';
import { CustomJwtPayload } from "../types/CustomJwtPayload";
import { generateRefreshToken } from "../helpers/generateRefreshToken";

/**
 *@method POST
 *@path /api/refresh
 */

export const refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }

    const refreshTokenTrimmed = refreshToken.split(" ")[1];
    const decodedRefreshToken = jwt.verify(refreshTokenTrimmed, secret.REFRESH_TOKEN_SECRET) as CustomJwtPayload;

    const foundUser = await prisma.refreshToken.findUnique({
        where: {
            id: decodedRefreshToken.refreshToken,
        },
    });

    if (!foundUser) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }
    await prisma.refreshToken.delete({
        where: { id: foundUser.id },
    });

    const newAccessToken = jwt.sign({ userId: foundUser.userId }, secret.ACCESS_TOKEN_SECRET, {
        expiresIn: "1m",
    });

    const hashedRefreshToken = await prisma.refreshToken.create({
        data: {
            userId: foundUser.userId,
        },
    });

    const newRefreshToken = generateRefreshToken(hashedRefreshToken)
    const csrfToken = req.csrfToken()
    // For web clients, set the refresh token in a secure cookie
    res.cookie("refreshToken", `Bearer ${newRefreshToken}`, {
        httpOnly: true,
        secure: secret.NODE_ENV === 'production', // set to true if using https
        sameSite: "strict", // adjust according to your needs
    }); 

    res.json({
        accessToken: `Bearer ${newAccessToken}`, // for both web and mobile
        refreshToken: req.body.isMobile ? `Bearer ${newRefreshToken}` : undefined, // only send if the client is mobile
        csrfToken: csrfToken
    });
};