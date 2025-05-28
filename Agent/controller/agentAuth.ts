import { Request, Response } from "express";
import Admin from "../../admin/models/auth";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import messages from "../../middleware/Message";

import nodemailer from 'nodemailer'
import { Sequelize } from 'sequelize';
import path, { join } from 'path';
import hbs from 'handlebars';
import fs from 'fs';
const templatePath = path.join(__dirname, '../../views/otptemplate.hbs');
const source = fs.readFileSync(templatePath, 'utf-8');
const template = hbs.compile(source);
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

let imageCounter = 0; // Initialize imageCounter


import crypto from 'crypto';
import Agent from "../../Agent/models/Agent";
import Job from "../models/job";
import { addHook } from "sequelize-typescript";
import Agency from "../../admin/models/Agency";
import MasterData from "../../admin/models/MasterData";
import customer from "../../admin/models/customer";
import Support from "../../Agent/models/support";
import { log } from "console";

export default {
    
    AgentLogin: async (req: Request, res: Response) => {
        try {


          const { agentId, password } = req.body;
         console.log('req.body', req.body)
          const messages = (req as any).messages

    
          // Validate user input
          if (!(agentId && password)) {
            return res
              .status(400)
              .json({ status: 0, message:messages.requiredInput});
          }
    
          // Find user by email
          const user = await Agent.findOne({ where: { agentId } });
    
          if (!user) {
            return res.status(400).json({ status: 0, message:messages.agentInvalid });
          }
    
          // Compare the provided password with the stored hashed password
          const isPasswordValid = await bcrypt.compare(
            password,
            user.password as unknown as string
          );
    
          if (!isPasswordValid) {
            return res.status(400).json({ status: 0, message:messages.invalidPassword });
          }
    
          // Generate JWT token
          const token = jwt.sign(
            {
              id: user.agentId,
              fullName: user.fullName,
              email: user.email,
            },
            process.env.TOKEN_KEY as string // Use your secret key stored in .env
          );
    
          // Respond with user data and the generated token
          return res.status(200).json({
            status: 1,
            message:messages.loginSuccess,
            data: {
              id: user.agentId,
              fullName: user.fullName,
              email: user.email,
              mobilenumber: user.mobilenumber,
              image: user.image,
              token: token,
              language: user.language 
            },
          });
        } catch (error) {
          // Handle unexpected errors
          console.error(error);
          return res
            .status(500)
            .json({ status: 0, message:messages.internalServerError});
        }
      },
      GetProfile: async (req: Request, res: Response) => {
        const user_id = req.user?.id;
        const messages = (req as any).messages

    
        const GetProfile = await Agent.findAll({
          where: {
            agentId: user_id,
          },
        });
        res.json({
          status: 1,
          message:messages.agentProfilesuccess,
          data: GetProfile,
        });
      },

      GetAgency: async (req: Request, res: Response) => {
        try {
          const messages = (req as any).messages
const user_id = req.user?.id;

const getAgency = await Agency.findAll();
          res.json({
            status: 1,
            message:messages.agencyGet,
            data: getAgency,
          });
        } catch (error) {
          
        }
      },
      UpdateAgentProfile: async (req: Request, res: Response) => {
        try {
          const messages = (req as any).messages

          // Get user_id from the request
          const user_id = req.user?.id;
          if (!user_id) {
            return res
              .status(400)
              .json({ message:messages.userNotFound});
          }
    
          // Get the updated user data from the request body
          const { fullName, email, mobilenumber } = req.body;
          console.log(req.body, "BODY");
          const image = req.file?.path; // Normalize path
    
          // Validate required fields
    
          // Assuming you're using Mongoose to interact with your database
          // You can modify this to use Sequelize or your specific ORM
          let user = await Agent.findByPk(user_id);
    
          if (!user) {
            return res.status(404).json({ message: messages.agentNotfound });
          }
    
          // Update the user's information
          user.fullName = fullName || user.fullName;
          user.email = email || user.email;
          user.mobilenumber = mobilenumber || user.mobilenumber;
          user.image = image || user.image;
    
          await user.save();
    
          // Return success response with the updated user data
          res.status(200).json({status:1, message:messages.agentUpdated, user });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: messages.internalServerError});
        }
      },
      ChangePass: async (req: Request, res: Response) => {
        try {
          const messages = (req as any).messages

          const { oldPassword, newPassword } = req.body;
    
          if (!oldPassword || !newPassword) {
            return res
              .status(400)
              .json({ status: 0, message:messages.oldNewPasswordRequired });
          }
    
          if (oldPassword === newPassword) {
            return res.status(400).json({
              status: 0,
              message:messages.newPasswordSame,
            });
          }
    
          const user = await Agent.findByPk(req.user?.id);
          console.log(user, "USER GET");
    
          if (!user) {
            return res.status(404).json({ status: 0, message: messages.userNotFound });
          }
    
          const isValidPassword = await bcrypt.compare(oldPassword, user.password); // Ensure 'user.password' is a string
    
          if (!isValidPassword) {
            return res
              .status(400)
              .json({ status: 0, message:messages.invalidPassword });
          }
    
          const hashedPassword = await bcrypt.hash(newPassword, 12);
    
          user.password = hashedPassword; // Ensure 'hashedPassword' type matches 'user.password'
          await user.save();
    
          return res
            .status(200)
            .json({ status: 1, message: messages.passwordChanged });
        } catch (err: any) {
          console.error("Error:", err.message);
          return res
            .status(500)
            .json({ status: 0, message:messages.passwordChangeFailed });
        }
      },
        ForgetPassword: async (req: Request, res: Response) => {
          const email = req.body.email;
          const messages = (req as any).messages

        try {
          // Step 1: Check if email exists in the database
          const user = await Agent.findOne({
            where: { email: email },
          });
    
          if (!user) {
            return res.status(400).json({ status: 0, message:messages.validEmailRequired });
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
            firstName: user.fullName,
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
              return res.status(500).json({ status: 0, message: messages.otpError });
            }
            return res.status(200).json({ status: 1, message:messages.otpSent });
          });
    
        } catch (error) {
          console.error(error);
          return res.status(500).json({ status: 0, message: messages.internalServerError });
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
          const user = await Agent.findOne({ where: { email } });
    
          if (!user) {
            return res.status(404).json({
              status: 0,
              message: messages.userNotFound});
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
              message: messages.otpExpiry,
            });
          }
    
          // Step 3: OTP is valid, proceed further (e.g., reset password)
          return res.status(200).json({
            status: 1,
            message: messages.OtpVerify,
          });
        } catch (error) {
          console.error('Error verifying OTP:', error);
          return res.status(500).json({
            status: 0,
            message: messages.internalServerError
          });
        }
      },
      UpdatePassword: async (req: Request, res: Response) => {
        const { email, newPassword } = req.body;
        try {
          const messages = (req as any).messages

          const user = await Agent.findOne({ where: { email } });
    
          if (!user) {
            return res.status(404).json({
              status: 0,
              message:messages.userNotFound,
            });
          }
    
          const hashedPassword = await bcrypt.hash(newPassword, 12);
    
          user.password = hashedPassword; // Ensure 'hashedPassword' type matches 'user.password'
          await user.save();
    
          return res.status(200).json({ status: 1, message: messages.passwordChanged });
    
        } catch (error) {
    
        }
    
      },
      AddJob: async (req: Request, res: Response) => {
      //   try { 
      //     const messages = (req as any).messages

      //     const agentId = req.user?.id;
      //     if (!agentId) {
      //         return res.status(401).json({ message: 'Unauthorized' });
      //     }
  
      //     const {
      //         customerName,
      //         customerId,
      //         site,
      //         carNumber,
      //         brand,
      //         element,
      //         deliveryDate,
      //         deliveryTime,
      //         newDamage,
      //         tasks = [] // Default to an empty array if not provided
      //     } = req.body;
  
      //     const photos = req.files
      //         ? (req.files as Express.Multer.File[]).map((file) => ({
      //             id: imageCounter++,
      //             image: file.path
      //         }))
      //         : [];
  
      //     // Process tasks (assign UUIDs)
      //     const parsedTasks = Array.isArray(tasks) 
      //     ? tasks 
      //     : typeof tasks === 'string' 
      //         ? JSON.parse(tasks) // If tasks is a stringified JSON array, parse it
      //         : [];
      
      // const processedTasks = parsedTasks.map((task: any) => ({
      //     id: uuidv4(),
      //     name: task.name
      // }));
  
      //     const newJob = await Job.create({
      //         customerName,
      //         site,
      //         carNumber,
      //         brand,
      //         element,
      //         deliveryDate,
      //         deliveryTime,
      //         newDamage,
      //         photos,
      //         tasks: processedTasks, // Ensure processed tasks are saved
      //         agentId,
      //         agencyId,
      //         uniqueId
      //     });
  
      //     return res.status(201).json({status:1, message:messages.jobAdded, job: newJob });
      // } catch (error) {
      //     console.error('Error adding job:', error);
      //     return res.status(500).json({ message:messages.internalServerError });
      // }
      },
      UpdateJob: async (req: Request, res: Response) => {
        try {
          const messages = (req as any).messages;
      
          const {
            jobId,
            customerName,
            site,
            carNumber,
            brand,
            element,
            deliveryDate,
            deliveryTime,
            newDamage,
            tasks = []
          } = req.body;
      
          const job = await Job.findByPk(jobId);
          if (!job) {
            return res.status(404).json({ status: 0, message: messages.jobNotFound });
          }
      
          // ⏳ Check if the job is older than 4 hours
          const createdAt = new Date(job.createdAt);
          const currentTime = new Date();
          const fourHoursInMs = 4 * 60 * 60 * 1000;
      
          if (currentTime.getTime() - createdAt.getTime() > fourHoursInMs) {
            return res.status(403).json({ status: 0, message: messages.updateTimeExpired || "Job can only be updated within 4 hours of posting." });
          }
      
          const parsedTasks = Array.isArray(tasks)
            ? tasks
            : typeof tasks === 'string'
              ? JSON.parse(tasks)
              : job.tasks;
      
          job.customerName = customerName || job.customerName;
          // job.customerId = customerId || job.customerId;
          job.site = site || job.site;
          job.carNumber = carNumber || job.carNumber;
          job.brand = brand || job.brand;
          job.element = element || job.element;
          job.deliveryDate = deliveryDate || job.deliveryDate;
          job.deliveryTime = deliveryTime || job.deliveryTime;
          job.newDamage = newDamage || job.newDamage;
          job.tasks = parsedTasks || job.tasks;
      
          let maxImageId = job.photos?.reduce((maxId, image) => Math.max(maxId, image.id), -1) || -1;
      
          // 📸 Handle new images (if any)
          const newImages: { id: number; image: string }[] = Array.isArray((req.files as Record<string, Express.Multer.File[]>)['images']) ?
            (req.files as Record<string, Express.Multer.File[]>)['images'].map((file: Express.Multer.File) => ({
              id: (++maxImageId),
              image: file.path || '',
            })) : [];
      
          job.photos = [...job.photos, ...newImages];
      
          // ❌ Handle removal of a specific image
          const imageIdToRemove = req.body.imageIdToRemove;
          if (imageIdToRemove) {
            const idToRemove = Number(imageIdToRemove);
            job.photos = job.photos.filter(image => image.id !== idToRemove);
          }
      
          await job.save();
      
          res.status(200).json({ status: 1, message: messages.jobUpdated, job });
      
        } catch (error) {
          console.error('Error updating job:', error);
          res.status(500).json({ status: 0, message: (req as any).messages.internalServerError });
        }
      },
      
    MyJOb: async (req: Request, res: Response) => {
      try {
        const messages = (req as any).messages

        const agentId = req.user?.id;
        const { status } = req.body; // Status ko body se le rahe hain
    
        if (!agentId) {
          return res.status(400).json({ status: 0, message: "Agent ID is required" });
        }
    
        if (!status) {
          return res.status(400).json({ status: 0, message: "Status is required" });
        }
    
        console.log(agentId, "AGENTID:::::::");
        console.log(status, "STATUS:::::::");
    
        const getjob = await Job.findAll({ 
          where: { 
            agentId: agentId,
            status: status // Yahan status ka filter add kiya gaya hai
          } 
        });
    
        console.log(getjob, "GET JOB");
    
        res.json({ status: 1, message: "Job retrieved successfully", data: getjob });
      } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ status: 0, message: "Internal Server Error" });
      }
    },
    CompleteJob: async (req: Request, res: Response) => {
      try {
        const messages = (req as any).messages

        const { jobId } = req.body; // Job ID ko body se le rahe hain
    
        if (!jobId) {
          return res.status(400).json({ status: 0, message: "Job ID is required" });
        }
    
        // Check if the job exists
        const job = await Job.findOne({ where: { id: jobId } });
    
        if (!job) {
          return res.status(404).json({ status: 0, message: "Job not found" });
        }
    
        // Update the job status to "Completed"
        await Job.update(
          { status: "Completed" }, 
          { where: { id: jobId } }
        );
    
        res.json({ status: 1, message: "Job marked as Completed successfully" });
      } catch (error) {
        console.error("Error updating job status:", error);
        res.status(500).json({ status: 0, message: "Internal Server Error" });
      }

    },
    GetMasterData: async (req: Request, res: Response) => {
try {
  
  const messages = (req as any).messages
  const type = req.body.type; 
  const masterdata = await MasterData.findAll({
    where: {
      type: type,
    },
  });
  res.json({
    status: 1,
    message:messages.masterDataget,
    data: masterdata,
  });

} catch (error) {
  console.error("Error fetching master data:", error);
  res.status(500).json({ status: 0, message: messages.internalServerError });
  
}

    },
       GetCustomer: async (req: Request, res: Response) => {
            try {
              const messages = (req as any).messages
const GetCustomer = await customer.findAll({
  attributes: [
    'id',
    ['fullName', 'name'] // aliasing fullName as name
  ]
}); 
  
                res.json({
                  status: 1,
                  message:messages.customerGet,
                  data: GetCustomer,
                });
             
              
            } catch (error) {
              console.error("Error fetching customer data:", error);
              res.status(500).json({ status: 0, message: messages.internalServerError });
              
            }
          },
    SupprtAdd : async (req: Request, res: Response) => {
      try {
        const agentId = req.user?.id;
        const { subject, comment } = req.body;
        const messages = (req as any).messages
        if (!agentId) {
          return res.status(401).json({ message: messages.agentNotfound });
        }
        if (!subject || !comment) {
          return res.status(400).json({ message: messages.subjectMessageRequired });
        }
        const addSupport = await Support.create({
          agentId,
          subject,
          comment,
        });
        res.status(200).json({ status: 1, message: messages.supportAdded });
      
        
      } catch (error) {
        console.error('Error adding support:', error);
        res.status(500).json({ status: 0, message: messages.internalServerError });
        
      }
    },
    AgencyGet: async (req: Request, res: Response) => {
      try {
        const agentId = req.user?.id;
    
        if (!agentId) {
          return res.status(401).json({ status: 0, message: "Unauthorized" });
        }
    
        // Find one job of the agent to get the agencyId
        const job = await Job.findOne({ where: { agentId } });
    
        if (!job || !job.agencyId) {
          return res.status(404).json({ status: 0, message: "No agency found for this agent" });
        }
    
        // Fetch agency details using the agencyId from the job
        const agency = await Agency.findByPk(job.agencyId,{
attributes:["id","Name","image","Location"]
        });
    
        if (!agency) {
          return res.status(404).json({ status: 0, message: "Agency not found" });
        }
    
        return res.status(200).json({ status: 1,message:"Agency get successfully", data:agency });
      } catch (error) {
        console.error("Error getting agency:", error);
        return res.status(500).json({ status: 0, message: "Internal Server Error" });
      }

    },
     SelectAgency: async (req:Request,res:Response)=>{
      try {
        const messages = (req as any).messages

        const agentId = req.user?.id; // Optional: if you want to filter by agent
  
        const customerNames = await Job.findAll({
          where: {
            agentId: agentId, // remove this if you want all customers
          },
          attributes: ['customerName'],
          group: ['customerName'], // to avoid duplicates
          raw: true,
        });
  
        return res.status(200).json({
          status: 1,
          message:messages.customerGet,
          data: customerNames.map(item => item.customerName), // return only names
        });
      } catch (error) {
        console.error('Error fetching customer names:', error);
        return res.status(500).json({
          status: 0,
          message:messages.internalServerError
        });
      }
    },

SartJob:async (req:Request,res:Response)=>{
  try {
    const jobId = req.body.jobId;
    const messages = (req as any).messages;

    const {
      customerName,
      site,
      carNumber,
      brand,
      element,
      deliveryDate,
      deliveryTime,
      newDamage,
      tasks = [],
      agentId,
      agencyId,
      uniqueId,

      status = "Ongoing"
    } = req.body;
    console.log(req.body,"BODY");
    
      const photos = req.files
            ? (req.files as Express.Multer.File[]).map((file) => ({
                id: imageCounter++,
                image: file.path
            }))
            : [];
            console.log(photos,"IMAGE");
            
    

    const parsedTasks = Array.isArray(tasks)
      ? tasks
      : typeof tasks === 'string'
      ? JSON.parse(tasks)
      : [];

    const processedTasks = parsedTasks.map((task: any) => ({
      id: uuidv4(),
      name: task.name
    }));

    const job = await Job.findByPk(jobId);

    if (!job) {
      return res.status(404).json({ status: 0, message: "Job not found" });
    }

    // Update all fields
    job.customerName = customerName || job.customerName;
    job.site = site || job.site;
    job.carNumber = carNumber || job.carNumber;
    job.brand = brand || job.brand;
    job.element = element || job.element;
    job.deliveryDate = deliveryDate || job.deliveryDate;
    job.deliveryTime = deliveryTime || job.deliveryTime;
    job.newDamage = newDamage || job.newDamage;
    job.tasks = processedTasks.length ? processedTasks : job.tasks;
    job.agentId = agentId || job.agentId;
    job.agencyId = agencyId || job.agencyId;
    job.photos = photos.length ? photos : job.photos;
    job.status = status || job.status
    job.uniqueId = uniqueId || job.uniqueId; // Add this line to update uniqueId

    await job.save();

    return res.status(200).json({
      status: 1,
      message: messages?.jobUpdated || "Job updated successfully",
      job
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
},
GetcustomerData:async (req:Request,res:Response)=>{
  try {
    const customerId = req.body.customerId; // Get customerId from request body
  const messages = (req as any).messages
  console.log(customerId,"CUSTOMER ID")
  if (!customerId) {
    return res.status(400).json({ status: 0, message: messages.customerIdRequired });
  }
const customerData = await Job.findOne({
  where: {  
    customerId: customerId,
  },
});

if (!customerData) {
  return res.status(404).json({ status: 0, message: messages.customerNotFound });
}

res.status(200).json({ status: 1, message: messages.customerDataFetched, data: customerData });
} catch (error) {
    console.error("Error fetching customer data:", error);
    return res.status(500).json({ status: 0, message: messages.internalServerError });
    
  }
},
LanguageChange: async (req: Request, res: Response) => {
  try {
    const messages = (req as any).messages
    const language = req.body.language; // Get the language from the request body
   console.log(language, "LANGUAGE::::::");
    const user_id = req.user?.id;

    if (!language) {
      return res.status(400).json({ status: 0, message: messages.languageRequired });
    }

    // Update the user's language preference
    const user = await Agent.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ status: 0, message: messages.userNotFound });
    }

    user.language = language;
    await user.save();

    return res.status(200).json({ status: 1, message: messages.languageChanged });
    
  } catch (error) {
    console.error("Error changing language:", error);
    const messages = (req as any).messages
    return res.status(500).json({ status: 0, message: messages.internalServerError });
    
  }
}

  
    
    
}