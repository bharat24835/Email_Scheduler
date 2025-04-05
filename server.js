import express from 'express'
import colors from 'colors'
import connectDB from './config/DB.js';
import eventRoutes from './routes/eventRoutes.js'
import RefreshEvent from './helpers/refresh.js';


const app = express();

app.use(express.json());
app.use('/event' , eventRoutes);



const port = 8000;



app.listen(port , ()=>{
    console.log(`Server is listening at PORT ${port}`.bgGreen);
    connectDB();
    // in this , whenEver server restart , just assign the Reschedule all the events store in Database
    RefreshEvent()
})