import { accountSid, authToken, fromAdminMail, fromAdminPhone, GMAIL_PASS, GMAIL_USER, userSubject } from "../config";
import nodemailer from "nodemailer";

export const GenerateOTP = () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
  return { otp, expiry };
};

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
  const client = require("twilio")(accountSid, authToken);

  const response = await client.messages.create({
    body: `Your OTP is ${otp}`,
    to: toPhoneNumber,
    from: fromAdminPhone,
  });
  return response;
};

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendmail = async (from: string, to: string, subject: string, html: string) => {
  try {
    const response = await transport.sendMail({
      from: fromAdminMail,
      to,
      subject: userSubject,
      html,
    });
    return response;
  } catch (err) {
    console.log(err);
  }
};

export const emailHTML = (otp: number): string => {
  const temp = `
  <div style="max-width:700px;  font-size:110%; border:10px solid #ddd; padding:50px 20px; margin:auto" text-align:center>
  <h2 style="text-transform:uppercase; color:teal; text-align:center">
  Welcome to Victory store
  </h2>
  <p>Hi there, your otp is ${otp}, it will expire in 30min</p>
  
  </div>
  `;
  return temp;
};
