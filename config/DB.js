import mongoose from 'mongoose'
import colors from 'colors'

const connectDB = async()=>{
    try {
       const conn = await mongoose.connect('mongodb+srv://bharat24835:bharat@cluster0.pn7ks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
       console.log(`DB is Connected  at ${conn.connection.host}`.bgCyan);
       
               
    } catch (error) {
        console.log(`Problem In Connect with DataBase and Error is ${error}`.bgRed);
        
    }
}
export default connectDB;