import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Session.d.ts.map