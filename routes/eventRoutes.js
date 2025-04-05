import express from 'express'
import { createEventController, deleteEventController, readEventController, updateEventController } from '../controllers/eventController.js';

const router = express.Router();


router.post("/create" , createEventController)
router.delete("/delete/:id" , deleteEventController)
router.put("/update/:id" , updateEventController)
router.get("/read", readEventController )


export default router;