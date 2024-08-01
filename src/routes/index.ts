import { Router } from "express";
import authRoutes from "./auth";
import refreshRoutes from "./refresh";
import logoutRoutes from "./logout";
import csrfTokenRoutes from "./csrf-token";
import { Request, Response } from "express";
import path from "path";
import authMiddleware from "../middlewares/auth";

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use(logoutRoutes)
rootRouter.use(refreshRoutes)
rootRouter.use(csrfTokenRoutes)
rootRouter.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});
rootRouter.post('/protected', authMiddleware, (req: Request, res: Response) => {
    res.status(200).send({
        success: true,
        user: req.user
    })
})
export default rootRouter;