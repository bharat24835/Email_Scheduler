import dotenv from "dotenv";
import { google } from "googleapis";
import nodemailer from "nodemailer";
dotenv.config();
import fs from "fs"; // File system module
import path from "path"; // Path module
import { fileURLToPath } from "url"; // To handle __dirname

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export async function sendEmail(toEmail, subject) {
  try {
    const filePath = path.join(__dirname, "files", "BharatSDE.pdf");

    if (!fs.existsSync(filePath)) {
      console.error("File not found:", filePath);
      return { success: false, error: "File not found" };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bharat248350@gmail.com",
        pass: process.env.APP_PASSWORD, // Store your app password in .env
      },
    });

    const mailOptions = {
      from: "Bharat <bharat248350@gmail.com>",
      to: toEmail,
      subject: subject,
      html: generateHTML(),
      attachments: [
        {
          filename: "BharatSDE.pdf",
          path: filePath,
        },
      ],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export const generateHTML = () => {
  return `<p>Hi, I&rsquo;m <strong>Bharat</strong> — a final year B.Tech Computer Science student at Galgotia College, currently interning as a <strong>Software Developer Intern at Cybermindworks</strong>.</p>

<p>At Cybermindworks, I&rsquo;ve contributed to scalable product development using <strong>Next.js, TanStack Query, Tailwind, NestJS</strong>, and deployed apps via <strong>AWS S3 and CloudFront — achieving a 72–82% cost reduction compared to traditional EC2 deployments. </strong> I&rsquo;ve built and <strong> delivered 15+ production-grade UI pages </strong> and integrated external APIs like <strong>LinkedIn Share</strong> to engage over 100K users.</p>

<p>Beyond work, I&rsquo;ve built projects like an <strong>E-commerce Website</strong> and a <strong>Real-Time Chat App</strong>, achieving up to <strong>26% performance boosts</strong> with optimization techniques like lazy loading and memoization.</p>

<p>I&rsquo;ve solved over <strong>960+ DSA problems</strong> across LeetCode and GFG, and I&rsquo;m deeply comfortable with <strong>React, Node.js, TypeScript, MongoDB</strong>, and system design fundamentals.</p>

<p>I&rsquo;m actively seeking <strong>SDE Internship or Full-Time Roles</strong> and would be grateful if you could consider me or refer me if any suitable opportunities come up.</p>

<p>Feel free to check out my resume and work below:</p>

<ul>
  <li><strong>📄 Resume:</strong> <a href="https://drive.google.com/file/d/15lyWyRt8SsZi9V7HNNxRa6KMzyMGkzeL/view?usp=sharing" target="_blank">Click to view</a></li>
  <li><strong>🌐 Portfolio:</strong> <a href="https://bharat24835.netlify.app" target="_blank">bharat24835.netlify.app</a></li>
  <li><strong>💻 GitHub:</strong> <a href="https://github.com/bharat24835" target="_blank">github.com/bharat24835</a></li>
  <li><strong>🔗 LinkedIn:</strong> <a href="https://www.linkedin.com/in/bharat24835/" target="_blank">linkedin.com/in/bharat24835</a></li>
  <li><strong>🧠 LeetCode:</strong> <a href="https://leetcode.com/u/bharat24835/" target="_blank">leetcode.com/u/bharat24835</a></li>
</ul>

<p>📞 <strong><a href="tel:+919627925287">+91-9627925287</a></strong><br/>
✉️ <a href="mailto:bharat248350@gmail.com">bharat248350@gmail.com</a></p>

<p>Thank you for your time and consideration.</p>

<p>Best regards,<br/><strong>Bharat</strong></p>`;
};

