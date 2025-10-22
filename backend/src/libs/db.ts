import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI_STRING || "");
    console.log("Liên kết database thành công!");
  } catch (err) {
    console.error("Không kết nối được database", err);
    process.exit(1);
  }
};
