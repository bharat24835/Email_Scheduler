import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
    },
    designation :{
     type:String,
     default:"Developer"
    },
    count: {
      type: Number,
      default: 10,
    },
    isSendAllowed: {
      type: Boolean,
      default: false,
    },
    isValidEmail :{
      type:Boolean,
      default : true
    },
    cronExpression: {
      type: String,
      default: ""
    },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
