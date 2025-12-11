import { Request, Response } from "express";
export declare const signUp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const signIn: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const signOut: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const refreshToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map