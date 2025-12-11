import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User";
export interface AuthRequest extends Request {
    user?: Omit<IUser, "hashedPassword">;
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authMiddleware.d.ts.map