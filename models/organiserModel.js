import mongoose from "mongoose";

const passwordSchema = new mongoose.Schema(
  {
    instaPassword: {
      type: String,
      required: true,
    },
    gmailPassword: {
      type: String,
    },
    viewedAt :{
        type : Date,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Password", passwordSchema);
