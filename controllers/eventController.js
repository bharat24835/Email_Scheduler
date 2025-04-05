import eventModel from "../models/eventModel.js";
import cron from 'node-cron';
import {generateCronExpression, scheduleEmail} from '../helpers/cronExpression.js'
import randomId from "random-id";

import { activeTasks } from '../data/activeTasks.js';

export  const createEventController = async(req, res)=>{
    try {
        
        const {option , days , date , time , email } = req.body;

        const id = randomId(10  , 'aA0');
        console.log(id);
        
       
        let cronExpression = generateCronExpression(option ,days, date , time);
        console.log(cronExpression);
        
        if (!cron.validate(cronExpression)) {
             return res.send({message : "Invalid cron expression generated"});
          }
        const event = await new eventModel({id : id  ,email ,   description : `new Event created and id is  ${id}`, cronExpression}).save();
        let subject = `<h2>Looking for SDE Internship</h2>`
        const task = scheduleEmail(cronExpression , email , subject  )
        // console.log(task);
        
        activeTasks.set(event._id.toString() , task);
        return res.send({message : "Event Create Successfully " , event  });
        
    } catch (error) {
     return res.send({message : "Error in Try block of createEventController" , error : error.message});
    }
}
export const deleteEventController = async(req ,res)=>{
    try {
        const id = req.params.id;
        const existingUser = await eventModel.findOneAndDelete({id});
        if(!existingUser){
            return res.send({message : `Event Number ${id} not Exists`});
        }
        if(activeTasks.has(existingUser._id.toString())){
            console.log("we are in map ");
            
            activeTasks.get(existingUser._id.toString()).stop();
            activeTasks.delete(existingUser._id.toString());
        }
        res.send({message  : `Event No ${existingUser.id} is Deleted`});


        
    } catch (error) {
        res.send({message  :"Error in Try Block of deleteEventController"});
    }
}

export const updateEventController = async(req , res)=>{
    try {
        const id = req.params.id;
        const existingUser = await eventModel.findOneAndUpdate({id} , {$inc : {count : 2}} , {new:true});
        if(!existingUser){
            return res.send({message  :"Event not found while Updating the Event "});
        }
        let updated = false;
        if(activeTasks.has(existingUser._id.toString())){
        activeTasks.get(existingUser._id.toString()).stop();
        activeTasks.delete(existingUser._id.toString());

        const task = cron.schedule("*/5 * * * * *" , ()=>{
            console.log(`From Controller :- Event Number ${existingUser.id} is Running and having Count ${existingUser.count}`);
            
        })
        activeTasks.set(existingUser._id.toString() , task);
        updated = true;
        }
        res.send({message :"Event Updated Successfully" , existingUser , updated});
        
    } catch (error) {
        res.send({message  :"Error in Try Block of updateEventController"});
    }
}

export const readEventController = async(req ,res)=>{
    try {

        const events = await eventModel.find();
        return res.send({message  : "Events are fetched Successfully " , events });
        
    } catch (error) {
        res.send({message : "Error in Try Block of readEventController"});
    }
}