import express from "express";
import {
  getPasswordController,
  setInstaPassword,
} from "../controllers/passwordController.js";
import {
  updateCountBasedOnEmail,
  updateValidEmail,
} from "../helpers/updateDatabse.js";

const router = express.Router();

router.get("/get", getPasswordController);
router.post("/setInstaPassword", setInstaPassword);

export default router;
