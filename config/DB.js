import mongoose from 'mongoose'
import colors from 'colors'

const connectDB = async()=>{
    try {
       const conn = await mongoose.connect(process.env.MONGODB_URL);
       console.log(`DB is Connected  at ${conn.connection.host}`.bgCyan);
       
               
    } catch (error) {
        console.log(`Problem while connecting with  DataBase and Error is ${error}`.bgRed);
        
    }
}
export default connectDB;