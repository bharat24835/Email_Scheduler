import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
      id :{
         type :String,
         required:true
      },
     description : {
      type : String
     }, 
     email :{
      type:String,
      required:true
     },
     count : {
      type : Number,
      default  : 0
     },
     cronExpression : {
      type : String,
      required : true
     }
} , {timestamps : true})

export default mongoose.model("app1-event" , eventSchema);