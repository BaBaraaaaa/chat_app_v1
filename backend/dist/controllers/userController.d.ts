import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
export declare const getMe: (req: AuthRequest, res: Response) => Response<any, Record<string, any>>;
export declare const searchUsers: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=userController.d.ts.map