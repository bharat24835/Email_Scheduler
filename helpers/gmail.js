import dotenv from 'dotenv'
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
dotenv.config();
import fs from "fs"; // File system module
import path from "path"; // Path module
import { fileURLToPath } from "url"; // To handle __dirname


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const USER = process.env.USER
const REFRESH_TOKEN = process.env.REFRESH_TOKEN 

// Create an OAuth2 client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export async function sendEmail(toEmail, subject) {
    try {
   

      const accessToken = await oAuth2Client.getAccessToken();

      const filePath = path.join(__dirname, "files", "Bharat-SDE.pdf");

      if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        return { success: false, error: "File not found" };
      }
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: USER, 
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken.token,
        },
      });
  
      const mailOptions = {
        from: "Bharat <your-email@gmail.com>",
        to: toEmail,
        subject: subject,
        html: generateHTML(),
        attachments: [
          {
            filename: "Bharat-SDE.pdf", // Visible name for recipient
            path: filePath, // Path to file on the server
          },
        ]
      };
  
      const result = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  export const generateHTML = ()=>{
    return `<p>I&rsquo;m&nbsp;<strong>Bharat</strong>, a B.Tech student in Computer Science at Galgotia College, with experience in full-stack development using&nbsp;<strong>ReactJS, Node.js, and MongoDB</strong>. I&rsquo;ve worked on projects like an&nbsp;<strong>E-commerce Website and Real-Time Chat App</strong>, achieving optimizations like a&nbsp;<strong>26% performance</strong>&nbsp;boost.<br />I&nbsp;have a strong foundation in&nbsp;<strong>Data Structures and Algorithms</strong>, having solved over&nbsp;<strong>700+ problems</strong>&nbsp;on<strong>&nbsp;LeetCode&nbsp;</strong>. I&rsquo;d love to discuss how my skills in&nbsp;<strong>Frontend and Backend systems</strong>&nbsp;can add value to your team. My resume is attached, and I&rsquo;m reachable at&nbsp;<strong>+91-9627925287</strong>&nbsp;or&nbsp;<a href="mailto:bharat24835@gmail.com" target="_blank">bharat248<wbr />35@gmail.com</a>.</p>
<div>&nbsp;</div>
<div>I'm reaching out to inquire about potential&nbsp;<strong>SDE internship or full-time opportunities</strong>. I would be grateful if you could consider referring me when such opportunities arise.<br /><br />Thank you for your time!<br /><br />Best regards,<br />Bharat<br /><a href="https://github.com/bharat24835" target="_blank" rel="noopener noreferrer" data-saferedirecturl="https://www.google.com/url?q=https://github.com/bharat24835&amp;source=gmail&amp;ust=1738014487307000&amp;usg=AOvVaw0yUchOH12YVBzn0Y06_U5N"><strong>Github</strong></a><strong>&nbsp;||&nbsp;</strong><a href="http://www.linkedin.com/in/bharat24835" target="_blank" rel="noopener noreferrer" data-saferedirecturl="https://www.google.com/url?q=http://www.linkedin.com/in/bharat24835&amp;source=gmail&amp;ust=1738014487307000&amp;usg=AOvVaw0WWh6rdGnt_ZMK8DFXuMLG"><strong>LinkedIn</strong></a><strong>&nbsp;||&nbsp;</strong><a href="https://leetcode.com/u/bharat24835/" target="_blank" rel="noopener noreferrer" data-saferedirecturl="https://www.google.com/url?q=https://leetcode.com/u/bharat24835/&amp;source=gmail&amp;ust=1738014487307000&amp;usg=AOvVaw2IRCjoBb7uAdX4VEL6y7N9"><strong>LeetCode</strong></a><strong><wbr />&nbsp;||&nbsp;<a href="https://bharat24835.netlify.app/" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://bharat24835.netlify.app/&amp;source=gmail&amp;ust=1738014487307000&amp;usg=AOvVaw0JqS9AzAQKabSbK1JVvq2_">Website</a>&nbsp;||&nbsp;<a href="https://bharat24835.netlify.app/" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://drive.google.com/file/d/16dcPwTg7X0ctT8WqGclzZuLf7ny4K3Y3/view?usp=drive_link/&amp;source=gmail&amp;ust=1738014487307000&amp;usg=AOvVaw0JqS9AzAQKabSbK1JVvq2_">Resume</a>&nbsp;</strong></div>`
  }

