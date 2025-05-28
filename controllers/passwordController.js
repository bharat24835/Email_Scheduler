import Password from "../models/organiserModel.js";
import { decrypt, encrypt } from "./encryptUtils.js";

export const getPasswordController = async (req, res) => {
  try {
    const { password } = req.body;
    if (password !== process.env.PASSWORD) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid password" });
    }

    const passwordDoc = await Password.findOne();
    if (!passwordDoc) {
      return res.status(404).json({ message: "Password not found" });
    }

    const { viewedAt, instaPassword } = passwordDoc;
    const currentDate = new Date();

    if (
      !viewedAt ||
      (currentDate - new Date(viewedAt)) / (1000 * 3600 * 24) >= 10
    ) {
      passwordDoc.viewedAt = currentDate;
      await passwordDoc.save();

      const decrypted = decrypt(instaPassword);
      return res.status(200).json({ instaPassword: decrypted });
    } else {
      const daysRemaining = Math.ceil(
        10 - (currentDate - new Date(viewedAt)) / (1000 * 3600 * 24)
      );
      return res.status(200).json({
        message: `You can access the password after ${daysRemaining} day(s)`,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const setInstaPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (password !== process.env.PASSWORD) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid password" });
    }

    let passwordDoc = await Password.findOne();
    if (passwordDoc?.instaPassword) {
      return res.status(200).json({
        message: "Instagram password already exists",
      });
    }

    const plainPassword = generatePassword();
    const encryptedPassword = encrypt(plainPassword);

    if (passwordDoc) {
      passwordDoc.instaPassword = encryptedPassword;
      await passwordDoc.save();
    } else {
      passwordDoc = await Password.create({ instaPassword: encryptedPassword });
    }

    return res.status(200).json({
      message: "Instagram password has been set successfully",
      instaPassword: plainPassword,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error setting password", error });
  }
};

export const generatePassword = () => {
  const length = 20;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
};
