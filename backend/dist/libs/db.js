"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDb = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI_STRING || "");
        console.log("Liên kết database thành công!");
    }
    catch (err) {
        console.error("Không kết nối được database", err);
        process.exit(1);
    }
};
exports.connectDb = connectDb;
//# sourceMappingURL=db.js.map