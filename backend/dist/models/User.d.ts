import mongoose from "mongoose";
import { Document } from "mongoose";
export interface IUser extends Document {
    username: string;
    email: string;
    hashedPassword: string;
    displayName: string;
    bio: string;
    avatarUrl?: string | null;
    avatarId?: string | null;
    phone?: string | null;
    friends?: mongoose.Types.ObjectId[];
}
declare const User: mongoose.Model<{
    username: string;
    email: string;
    hashedPassword: string;
    displayName: string;
    bio: string;
    friends: mongoose.Types.ObjectId[];
    avatarUrl?: string | null;
    avatarId?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    username: string;
    email: string;
    hashedPassword: string;
    displayName: string;
    bio: string;
    friends: mongoose.Types.ObjectId[];
    avatarUrl?: string | null;
    avatarId?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    username: string;
    email: string;
    hashedPassword: string;
    displayName: string;
    bio: string;
    friends: mongoose.Types.ObjectId[];
    avatarUrl?: string | null;
    avatarId?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    username: string;
    email: string;
    hashedPassword: string;
    displayName: string;
    bio: string;
    friends: mongoose.Types.ObjectId[];
    avatarUrl?: string | null;
    avatarId?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    username: string;
    email: string;
    hashedPassword: string;
    displayName: string;
    bio: string;
    friends: mongoose.Types.ObjectId[];
    avatarUrl?: string | null;
    avatarId?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    username: string;
    email: string;
    hashedPassword: string;
    displayName: string;
    bio: string;
    friends: mongoose.Types.ObjectId[];
    avatarUrl?: string | null;
    avatarId?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default User;
//# sourceMappingURL=User.d.ts.map