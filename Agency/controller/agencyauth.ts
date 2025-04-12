
import { Request, Response } from "express";
import Admin from "../../admin/models/auth";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";

import nodemailer from 'nodemailer'
import { Sequelize } from 'sequelize';
import path from 'path';
import hbs from 'handlebars';
import fs from 'fs';
const templatePath = path.join(__dirname, '../../views/otptemplate.hbs');
const source = fs.readFileSync(templatePath, 'utf-8');
const template = hbs.compile(source);

import crypto from 'crypto';
import Agent from "../../Agent/models/Agent";

import messages from "../../middleware/Message";
import Job from "../../Agent/models/job";
import Agency from "../../admin/models/Agency";

export default {
    
    AgencyLogin: async (req: Request, res: Response) => {
        try {
          const { email, password } = req.body;
          const messages = (req as any).messages
          // console.log(messages, "MESSAGES");  
    
          // Validate user input
          if (!(email && password)) {
            return res
              .status(400)
              .json({ status: 0, message:messages.requiredInput });
          }
    
          // Find user by email
          const user = await Agency.findOne({ where: { email } });
    
          if (!user) {
            return res.status(400).json({ status: 0, message:messages.invalidEmail});
          }
    
          // Compare the provided password with the stored hashed password
          const isPasswordValid = await bcrypt.compare(
            password,
            user.password as unknown as string
          );
    
          if (!isPasswordValid) {
            return res.status(400).json({ status: 0, message:messages.invalidPassword});
          }
    
          // Generate JWT token
          const token = jwt.sign(
            {
              id: user.id,
              Name: user.Name,
              email: user.email,
            },
            process.env.TOKEN_KEY as string // Use your secret key stored in .env
          );
    
          // Respond with user data and the generated token
          return res.status(200).json({
            status: 1,
            message:messages.loginSuccess,
            data: {
              id: user.id,
              Name: user.Name,
              email: user.email,
              mobilenumber: user.mobilenumber,
              image: user.image,
              token: token,
            },
          });
        } catch (error) {
          // Handle unexpected errors
          console.error(error);
          return res
            .status(500)
            .json({ status: 0, message:messages.internalServerError });
        }
      },
      GetAgency: async (req: Request, res: Response) => {
        const user_id = req.user?.id;
    
        const getAdmin = await Agency.findAll({
          where: {
            id: user_id,
          },
        });
        res.json({
          status: 1,
          message:messages.agencyProfilesuccess,
          data: getAdmin,
        });
      },
      UpdateAgency: async (req: Request, res: Response) => {
        try {
        const messages = (req as any).messages
          console.log(messages, "MESSAGES"); 
          // Get user_id from the request
          const user_id = req.user?.id;
          if (!user_id) {
            return res
              .status(400)
              .json({ message:messages.invalidUserId })//"User ID is missing or invalid" });
          }
    
          // Get the updated user data from the request body
          const { Name, email, mobilenumber } = req.body;
          console.log(req.body, "BODY");
          const image = req.file?.path; // Normalize path
    
          // Validate required fields
    
          // Assuming you're using Mongoose to interact with your database
          // You can modify this to use Sequelize or your specific ORM
          let user = await Agency.findByPk(user_id);
    
          if (!user) {
            return res.status(404).json({ message: messages.userNotFound });
          }
    
          // Update the user's information
          user.Name = Name || user.Name;
          user.email = email || user.email;
          user.mobilenumber = mobilenumber || user.mobilenumber;
          user.image = image || user.image;
    
          await user.save();
    
          // Return success response with the updated user data
          res.status(200).json({ message:messages.userUpdated, user });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: messages.internalServerError });
        }
      },
      ChangePass: async (req: Request, res: Response) => {
        try {
          const { oldPassword, newPassword } = req.body;
          const messages = (req as any).messages              
    
          if (!oldPassword || !newPassword) {
            return res
              .status(400)
              .json({ status: 0, message: messages.oldNewPasswordRequired });
          }
    
          if (oldPassword === newPassword) {
            return res.status(400).json({
              status: 0,
              message: messages.newPasswordSame,
            });
          }
    
          const user = await Agency.findByPk(req.user?.id);
          console.log(user, "USER GET");
    
          if (!user) {
            return res.status(404).json({ status: 0, message:messages.userNotFound });
          }
    
          const isValidPassword = await bcrypt.compare(oldPassword, user.password); // Ensure 'user.password' is a string
    
          if (!isValidPassword) {
            return res
              .status(400)
              .json({ status: 0, message:messages.invalidOldPassword });
          }
    
          const hashedPassword = await bcrypt.hash(newPassword, 12);
    
          user.password = hashedPassword; // Ensure 'hashedPassword' type matches 'user.password'
          await user.save();
    
          return res
            .status(200)
            .json({ status: 1, message:messages.passwordChanged });
        } catch (err: any) {
          console.error("Error:", err.message);
          return res
            .status(500)
            .json({ status: 0, message: messages.passwordChangeFailed });
        }
      },
        ForgetPassword: async (req: Request, res: Response) => {
          const email = req.body.email;
          const messages = (req as any).messages    
    
        try {
          // Step 1: Check if email exists in the database
          const user = await Agency.findOne({
            where: { email: email },
          });
    
          if (!user) {
            return res.status(400).json({ status: 0, message:messages.validEmailRequired});
          }
    
          // Step 2: Generate OTP (Random token for password reset)
          const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
          const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expiration in 10 minutes
          await user.update({
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires, // Correctly passing Date object
          });
          const emailData = {
            companyName: "Your Company Name",
            firstName: user.Name,
            action: "reset your password",
            otp: resetToken,
            otpExpiry: "10 minutes",
    
        };
    
        const htmlContent = template(emailData);
    
          // Step 4: Send OTP via email
          const transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email service provider
            auth: {
              user: 'tryoutscout@gmail.com',
              pass: 'xapfekrrmvvghexe'
          }
          });
    
          const mailOptions = {
            from: 'tryoutscout@gmail.com',
            to: email,
            subject: 'Password Reset OTP',
            html: htmlContent,
    
          };
    
          // Send the email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return res.status(500).json({ status: 0, message: messages.otpError});
            }
            return res.status(200).json({ status: 1, message:messages.otpSent  });
          });
    
        } catch (error) {
          console.error(error);
          return res.status(500).json({ status: 0, message:messages.internalServerError });
        }
    
      },
      OtpVerify: async (req: Request, res: Response) => {
        const { email, otp } = req.body;
        const messages = (req as any).messages

        console.log(req.body, "BODY");
        if(!otp){
        return  res.json({status:0, message:messages.emailOtpRequired})
        }
    
        try {
          // Step 1: Check if the email exists
          const user = await Agency.findOne({ where: { email } });
    
          if (!user) {
            return res.status(404).json({
              status: 0,
              message:messages.userNotFound,
            });
          }
    
          // Step 2: Check if the OTP is valid
          const currentTime = new Date();
          if (
            user.resetPasswordToken !== otp || // OTP mismatch
            !user.resetPasswordExpires || // Expiry not set
            user.resetPasswordExpires < currentTime // OTP expired
          ) {
            return res.status(400).json({
              status: 0,
              message: messages.invalidOtp,
            });
          }
    
          // Step 3: OTP is valid, proceed further (e.g., reset password)
          return res.status(200).json({
            status: 1,
            message: messages.otpVerified,
          });
        } catch (error) {
          console.error('Error verifying OTP:', error);
          return res.status(500).json({
            status: 0,
            message: messages.internalServerError,
          });
        }
      },
      UpdatePassword: async (req: Request, res: Response) => {
        const { email, newPassword } = req.body;
        const messages = (req as any).messages
        try {
          const user = await Agency.findOne({ where: { email } });
    
          if (!user) {
            return res.status(404).json({
              status: 0,
              message: messages.userNotFound,
            });
          }
    
          const hashedPassword = await bcrypt.hash(newPassword, 12);
    
          user.password = hashedPassword; // Ensure 'hashedPassword' type matches 'user.password'
          await user.save();
    
          return res.status(200).json({ status: 1, message:  messages.passwordUpdated});
    
        } catch (error) {
            console.error('Error updating password:', error);
            return res.status(500).json({
                status: 0,
                message: messages.internalServerError,
            });
    
        }
    
      },
    }