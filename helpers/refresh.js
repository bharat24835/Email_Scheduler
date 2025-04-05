import mongoose from "mongoose";
import cron from 'node-cron'
import eventModel from "../models/eventModel.js";

import { activeTasks } from "../data/activeTasks.js";


const RefreshEvent = async()=>{
    try {

        const collections = await  eventModel.find();
        // console.log(collections);
        collections.forEach((collection)=>{
           
            if(!activeTasks.has(collection._id)){
                const task = cron.schedule(collection.cronExpression, ()=>{
                    console.log(`From Refresh :- Event Number ${collection.id} is Running and having Count ${collection.count}`);  
                })
                activeTasks.set(collection._id.toString() , task)
            }
        })


        

        
    } catch (error) {
        console.log(`Event not Scheduled`.bgRed);
        
    }
}

export default RefreshEvent;
