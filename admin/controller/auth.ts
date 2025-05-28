
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
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { createObjectCsvStringifier } from 'csv-writer';

let imageCounter = 0; // Initialize imageCounter


import crypto from 'crypto';
import Agent from "../../Agent/models/Agent";
import customer from "../models/customer";
import MasterData from "../models/MasterData";
import messages from "../../middleware/Message";
import Job from "../../Agent/models/job";
import Terms from "../models/terms";
import Support from "../../Agent/models/support";
import Agency from "../../admin/models/Agency";
import ExcelJS from 'exceljs';

import { log } from "console";
const getTimeRanges = () => {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfYear = new Date(now.getFullYear(), 0, 1);

  return { startOfToday, startOfWeek, startOfMonth, startOfYear };
};



export default {
    
    AdminLogin: async (req: Request, res: Response) => {
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
          const user = await Admin.findOne({ where: { email } });
    
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
              id: user.id,
              fullName: user.fullName,
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
      GetAdmin: async (req: Request, res: Response) => {
        const user_id = req.user?.id;
    
        const getAdmin = await Admin.findAll({
          where: {
            id: user_id,
          },
        });
        res.json({
          status: 1,
          message:messages.adminProfileSuccess,
          data: getAdmin,
        });
      },
      UpdateAdmin: async (req: Request, res: Response) => {
        try {
          // Get user_id from the request
          const user_id = req.user?.id;
          if (!user_id) {
            return res
              .status(400)
              .json({ message:messages.invalidUserId })//"User ID is missing or invalid" });
          }
    
          // Get the updated user data from the request body
          const { fullName, email, mobilenumber } = req.body;
          console.log(req.body, "BODY");
          const image = req.file?.path; // Normalize path
    
          // Validate required fields
    
          // Assuming you're using Mongoose to interact with your database
          // You can modify this to use Sequelize or your specific ORM
          let user = await Admin.findByPk(user_id);
    
          if (!user) {
            return res.status(404).json({ message: messages.userNotFound });
          }
    
          // Update the user's information
          user.fullName = fullName || user.fullName;
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
    
          const user = await Admin.findByPk(req.user?.id);
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
    
        try {
          // Step 1: Check if email exists in the database
          const user = await Admin.findOne({
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
        console.log(req.body, "BODY");
        if(!otp){
        return  res.json({status:0, message:messages.emailOtpRequired})
        }
    
        try {
          // Step 1: Check if the email exists
          const user = await Admin.findOne({ where: { email } });
    
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
        try {
          const user = await Admin.findOne({ where: { email } });
    
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
    
        }
    
      },
      AgentAdd: async (req: Request, res: Response) => {
        try {
            const { fullName, email, mobilenumber } = req.body;
            const messages = (req as any).messages
            console.log(req.body, "BODY");
            const image = "uploads\\0e52e20c-f8bc-4a04-acda-9148c01b8ab0.png";
            const password = crypto.randomBytes(8).toString("hex");
            const hashedPassword = await bcrypt.hash(password, 10);

        
            const addagent = await Agent.create({
              fullName,
              email,
              mobilenumber,
              password: hashedPassword,
              image,
            });
            console.log(addagent.agentId, "AGENT");
        
            // Nodemailer configuration
            const transporter = nodemailer.createTransport({
              service: "gmail", // Use the appropriate email service
              auth: {
                  user: 'tryoutscout@gmail.com',
                  pass: 'xapfekrrmvvghexe'
              }
            });
        
            const mailOptions = {
              from: "tryoutscout@gmail.com",
              to: email,
              subject: "Agent Account ",
              text: `Hello ${fullName},\n\nYour Agent account has been created successfully.\n\nYour login credentials are:\nAgentId: ${addagent.agentId}\nPassword: ${password}\n\nPlease change your password upon first login.\n\nRegards,\nAdmin Team`,
            };
        
            // Send email
            await transporter.sendMail(mailOptions);
        
            res.status(201).json({
              status: 1,
              message: messages.agentAdded,
              da: addagent,
            });
      
            
        } catch (error) {
            
        }
      },
      GetAgent: async (req: Request, res: Response) => {
        try {
            
        } catch (error) {
            
        }
      },
      AddAgency: async (req: Request, res: Response) => {
        try {
          const {fullName,Location,agentId,email}
            
           = req.body
          console.log(req.body, "BODY");
          const messages = (req as any).messages
          console.log(messages, "MESSAGES");
          
          const image = req.file?.path
          console.log(req.file, "FILE");
          console.log(image, "IMAGE");
          
          const password = crypto.randomBytes(8).toString("hex");
          const hashedPassword = await bcrypt.hash(password, 10);
          const agentIdsArray: string[] = Array.isArray(agentId)
          ? agentId
          : typeof agentId === "string"
          ? agentId.split(",").map((id: string) => id.trim())
          : [];
        
          
      
          const addagency = await Admin.create({
            fullName,
            Location,
            image,
            agentId: agentIdsArray,

            email,
            role:"Agency",
            password: hashedPassword,
          });
          console.log(addagency, "AGENCY");
          const transporter = nodemailer.createTransport({
            service: "gmail", // Use the appropriate email service
            auth: {
                user: 'tryoutscout@gmail.com',
                pass: 'xapfekrrmvvghexe'
            }
          });
      
          const mailOptions = {
            from: "tryoutscout@gmail.com",
            to: email,
            subject: "Agency Account",
            text: `Hello ${fullName},\n\nYour Agency  account has been created successfully.\n\nYour login credentials are:\email: ${addagency.email}\nPassword: ${password}\n\nPlease change your password upon first login.\n\nRegards,\nAdmin Team`,
          };
      
          // Send email
          await transporter.sendMail(mailOptions);
      // console.log(mailOptions,"MAILOPTION");
      

          
          res.status(200).json({
            status: 1,
            message:messages.agencyAdded,
            data: addagency,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ status: 0, message:messages.internalServerError });
          
        }
      },
      GetAgency: async (req: Request, res: Response) => {
        try {
          const { page = 1, pageSize = 10, search = "" } = req.body;
          const offset = (Number(page) - 1) * Number(pageSize);
          const limit = Number(pageSize);
          const messages = (req as any).messages;
    
          // Total count fetch karna for pagination
          const totalCount = await Agency.count({
            where: search ? { Name: { [Op.like]: `%${search}%` } } : undefined,
          });
    
          // Agency records fetch karna with pagination & search
          const getAgency = await Agency.findAll({
            attributes: ['id', 'Name', 'Location', 'agentId'],
            where: search ? { Name: { [Op.like]: `%${search}%` } } : undefined,
            limit,
            offset,
          });
    
          return res.status(200).json({
            status: 1,
            message: messages.agencyget,
            data: getAgency,
            pagination: {
              totalPages: Math.ceil(totalCount / pageSize), // Fix: Total pages calculated
              totalCount,
              currentPage: Number(page),
              pageSize: Number(pageSize),
            },
          });
            
        } catch (error) {
          console.error(error);
          res.status(500).json({ status: 0, message: messages.internalServerError });
            
        }
      },
      UpdateAgency: async (req: Request, res: Response) => {
        try {
           const {
            id,
            fullName,
            Location
          } = req.body;
          const image = req.file?.path;
          const agency = await Admin.findByPk(id);
          if (!agency) {
            return res.status(404).json({ message: messages.agencyNotFound });

           }
            agency.fullName = fullName || agency.fullName;
            agency.Location = Location || agency.Location;
            agency.image = image || agency.image;
            await agency.save();
            res.status(200).json({ status:1,message: messages.agencyUpdated, agency });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: messages.internalServerError});

            
        }
      },
      DeleteAgency: async (req: Request, res: Response) => {
        try {
            const id = req.body.id;
            const agency = await Agency.findByPk(id);
            if (!agency) {
              return res.status(404).json({ message: messages.agencyDeleted });
            }
            await agency.destroy();
            res.status(200).json({status:1, message:messages.agencyDeleted
            });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });

            
        }
      },
      AddCustomer: async (req: Request, res: Response) => {
        try {
          const{
            fullName,
            email,

          }= req.body;
          const AddCustomer = await customer.create({
            fullName,
            email,
          })
          res.json({status:1,message:messages.customerAdded,data:AddCustomer})
          
        } catch (error) {

          
        }
      },
      UpdateCustomer: async (req: Request, res: Response) => {
        try {
          const {
           id,
           fullName,
           email
         } = req.body;
         const messages = (req as any).messages
         const image = req.file?.path;
         const customers = await customer.findByPk(id);
         if (!customers) {
           return res.status(404).json({ message:messages.userNotFound
            });

          }
          customers.fullName = fullName || customers.fullName;
          customers.email = email || customers.email;
          customers.image = image || customers.image;
           await customers.save();
           res.status(200).json({ status:1,message:messages.customerUpdated ,data:customers
            });
           
       } catch (error) {
           console.error(error);
           res.status(500).json({ message: messages.internalServerError });

           
       }
      },
      DeleteCustomer: async (req: Request, res: Response) => {
        try {
          const id = req.body.id;
          const messages = (req as any).messages
          console.log(messages, "MESSAGES");
          console.log(id, "ID");
          const custpmers = await customer.findByPk(id);
          if (!custpmers) {
            return res.status(404).json({ message:messages.userNotFound });
          }
          await custpmers.destroy();
          res.status(200).json({status:1, message: messages.customerDeleted });
          
      } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });

          
      }
      },
      GetCustomer: async (req: Request, res: Response) => {
        try {
        const { page = 1, pageSize = 10, search = "" } = req.body;
        const offset = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);

        const messages = (req as any).messages;
        const totalCount = await customer.count({
          where: search ? { fullName: { [Op.like]: `%${search}%` } } : undefined,
        });
        const getCustomer = await customer.findAll({
          attributes: ['id', 'fullName'],
          where: search ? { fullName: { [Op.like]: `%${search}%` } } : undefined,
          limit,
          offset,
        });
        return res.status(200).json({
          status: 1,
          message: messages.customerGet,
          data: getCustomer,
          pagination: {
            totalPages: Math.ceil(totalCount / pageSize),
            totalCount,
            currentPage: Number(page),
            pageSize: Number(pageSize),
          },
        }); 
        
          
        } catch (error) {
          console.error(error);
          res.status(500).json({ status: 0, message: messages.internalServerError });
          
        }
      },
      AddMasterData: async (req: Request, res: Response) => {
        try {
          const {
            name, 
            type
          }= req.body
          const AddMasterData = await MasterData.create({
            name,
            type
          })
          res.json({
            status:1,
            message:messages.masterDataAdded,
            data:AddMasterData
          })
          
        } catch (error) {
          
        }
      },
    UpdateMasterData: async (req: Request, res: Response) => {
      try {
        const{
          id, 
          name,
          type
        } = req.body
        const master  = await MasterData.findByPk(id);
        if (!master) {
          return res.status(404).json({ message:messages.masterDataNotFound });

         }
         master.name = name || master.name;
         master.type = type || master.type;
        //  customers.image = image || customers.image;
          await master.save();
          res.status(200).json({ status:1,message: messages.masterDataUpdated,data:master
           });
          
      } catch (error) {
          console.error(error);
          res.status(500).json({ message: messages.internalServerError });

          
      }


      },

    DeleteMasterData: async (req: Request, res: Response) => {
      try {
        const id = req.body.id;
        const master = await MasterData.findByPk(id);
        if (!master) {
          return res.status(404).json({ message: "master data  not found" });
        }
        await master.destroy();
        res.status(200).json({status:1, message: "master data deleted successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });

        
    }
    },
    GetMasterData: async (req: Request, res: Response) => {
      try {

        
      } catch (error) {
        
      }
    },
    UpdateLanguage: async (req: Request, res: Response) => {
      try {
        const { language } = req.body;
        const userId = req.user?.id; // Assuming `req.user` contains the authenticated user
    
        if (!language) {
          return res.status(400).json({ message: "" });
        }
    
        // Update the user's language preference
        const [updatedRows] = await Admin.update({ language }, { where: { id: userId } });
    
        if (updatedRows === 0) {
          return res.status(404).json({ message:messages.userNotFound });
        }
    
        // Fetch the updated user data
        const updatedUser = await Admin.findByPk(userId);
    
        res.status(200).json({
          message: messages.languageUpdated,
          language: updatedUser?.language,
        });
      } catch (error) {
        console.error("Error updating language:", error);
        res.status(500).json({ message: messages.internalServerError});
      }
    
    },
    GetJob: async (req: Request, res: Response) => {
      try {
        const { page = 1, pageSize = 10, search = "" } = req.body;
        const offset = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);
        const messages = (req as any).messages;
    
        // Total count fetch karna for pagination
        const totalCount = await Job.count({
          where: search ? { site: { [Op.like]: `%${search}%` } } : undefined,
        });
    
        // Job records fetch karna with pagination & search
        const getJobs = await Job.findAll({
          attributes: ['id', 'deliveryDate', 'site', 'agentId','status'],
          where: search ? { site: { [Op.like]: `%${search}%` } } : undefined,
          limit,
          offset,
        });
    
        // Har job ke agentId se Agent ka data fetch karna
        const jobsWithAgentData = await Promise.all(
          getJobs.map(async (job) => {
            const agent = await Agent.findOne({
              where: { agentId: job.agentId },
              attributes: ['fullName', 'image'],
            });
    
            return {
              ...job.toJSON(),
              agentFullName: agent ? agent.fullName : null,
              agentImage: agent ? agent.image : null,
              
            };
          })
        );
    
        return res.status(200).json({
          status: 1,
          message: messages.jobget,
          data: jobsWithAgentData,
          pagination: {
            totalPages: Math.ceil(totalCount / pageSize), // Fix: Total pages calculated
            totalCount,
            currentPage: Number(page),
            pageSize: Number(pageSize),
          },
        });
      } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
      }
    },
    
    
    jobDetails: async (req: Request, res: Response) => {
      try {
        const jobId= req.body.jobId
        const jobDetails = await Job.findAll({
          where:{
            id:jobId
          }
        })
          
        const messages = (req as any).messages

    
        const jobsWithDetails = await Promise.all(
          jobDetails.map(async (job) => {
            const agent = await Agent.findOne({
              where: { agentId: job.agentId },
              attributes: ['fullName', 'image'],
            });
    
            const agency = await Agency.findOne({
              where: {
                id: job.agencyId
              },
              attributes: ['Name', 'image', 'Location']
            });
    
            return {
              ...job.toJSON(),
              agentFullName: agent?.fullName || null,
              agentImage: agent?.image || null,
              agencyName: agency?.Name || null,
              agencyImage: agency?.image || null,
              agencyLocation: agency?.Location || null,
            };
          })
        );
    
    
    
        return res.status(200).json({status:1,message:messages.getjobDetails, data: jobsWithDetails
        });
      } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
      }
    },
    JobDelete: async (req: Request, res: Response) => {
      try {
        const messages = (req as any).messages

        const id = req.body.id;
        
        const Job = await Agency.findByPk(id);
        if (!Job) {
          return res.status(404).json({ message: messages.jobNotFound });
        }
        await Job.destroy();
        res.status(200).json({status:1, message:messages.jobDeleted
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });

        
    }
    },
    Termsandcondition: async (req: Request, res: Response) => {
      try {
        const { text } = req.body; // Define the text variable
        let terms = await Terms.findOne();
        if (terms) {
          await terms.update({ text });
          console.log('Terms updated successfully.');
        } else {
          await Terms.create({ text });
          console.log('Terms added successfully.');
        }
        res.json({status:1,message:messages.termsUpdated})

        
      } catch (error) {
        
        
      }
    },
    GetSupport : async (req: Request, res: Response) => {
try {
  const { page = 1, pageSize = 10, search = "" } = req.body;
  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);
  const messages = (req as any).messages;
  const totalCount = await Support.count({
    where: search ? { subject: { [Op.like]: `%${search}%` } } : undefined,

  });
  const getSupport = await Support.findAll({  
      
      attributes: ['id', 'subject', 'comment','agentId','isReply'],
      where: search ? { subject: { [Op.like]: `%${search}%` } } : undefined,
      limit,
      offset,
    });    
    console.log(getSupport, "GET SUPPORT");
    

  const agentData = await Promise.all(
    getSupport.map(async (support) => {
      const agent = await Agent.findOne({
        where: { agentId: support.agentId },
        attributes: ['fullName', 'image'],
      });
      // console.log(agentData,"Agent Data")
      // Check if agent exists before accessing properties
      return {
        ...support.toJSON(),
        agentFullName: agent ? agent.fullName : null,
        agentImage: agent ? agent.image : null,
      };
    })
  );
  return res.status(200).json({ 
    status: 1,
    message: messages.supportGet,
    data: agentData,
    pagination: {
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      currentPage: Number(page),
      pageSize: Number(pageSize),
    },
  });
  
} catch (error) {
  console.error(error);
  res.status(500).json({ status: 0, message: messages.internalServerError });
  
}
    },
    ReplySupport: async (req: Request, res: Response) => {
      try {
        const { id, reply } = req.body;
        const messages = (req as any).messages
        const support = await Support.findByPk(id);
        if (!support) {
          return res.status(404).json({ message: messages.supportNotFound });
        }
        const agentemail = support.agentId
        const agent = await Agent.findOne({
          where: { agentId: agentemail },
          attributes: ['email'],
        });
        if (!agent) {
          return res.status(404).json({ message: messages.agentNotFound });
        }
        const replytemailtemplatePath = path.join(__dirname, "../../views/reply-email.hbs");
        const replytemplateSource = fs.readFileSync(replytemailtemplatePath, "utf-8");
        const compiledTemplate = hbs.compile(replytemplateSource);
        const emailContent = compiledTemplate({
          subject: support.subject,
          reply: reply,
        });
        const emailData = {
            userMessage: support.comment,
            adminReply: reply
        };
        console.log(emailData,"EMAIL DATA");
        
        const htmlContent = compiledTemplate(emailData);

        // **Send Email**
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "tryoutscout@gmail.com",
                pass: "xapfekrrmvvghexe",
            },
        });
    
        const mailOptions = {
            from: "tryoutscout@gmail.com",
            to: agent.email,
            subject: `Reply to: ${support.subject}`,
            // text: `Subject: ${support.subject}\n\nReply: ${reply}`,
            html: htmlContent,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending welcome email:", error);
            } else {
                console.log("Welcome email sent:", info.response);
            }
        });  
    
              support.isReply = true; // Set isReply to true
        await support.save();
        res.status(200).json({ status: 1, message: messages.supportReply });
 
      } catch (error) {
        
      }
    },
    jobAdd:async (req:Request,res:Response) =>{
           try { 
          const messages = (req as any).messages

          const {
              customerName,
              site,
              carNumber,
              brand,
              element,
              deliveryDate,
              deliveryTime,
              newDamage,
              agentId,
              agencyId,
              tasks = [] // Default to an empty array if not 
          } = req.body;
  
          // const photos = req.files
          //     ? (req.files as Express.Multer.File[]).map((file) => ({
          //         id: imageCounter++,
          //         image: file.path
          //     }))
          //     : [];
  
          // Process tasks (assign UUIDs)
          const parsedTasks = Array.isArray(tasks) 
          ? tasks 
          : typeof tasks === 'string' 
              ? JSON.parse(tasks) // If tasks is a stringified JSON array, parse it
              : [];
      
      const processedTasks = parsedTasks.map((task: any) => ({
          id: uuidv4(),
          name: task.name
      }));
          // Generate uniqueId in desired format: #ABC4567898
          const randomNumber = Math.floor(100000000 + Math.random() * 900000000); // 9-digit number
          const uniqueId = `#ABC${randomNumber}`;
  
          const newJob = await Job.create({
              customerName,
              site,
              carNumber,
              brand,
              element,
              deliveryDate,
              deliveryTime,
              newDamage,
              // photos,
              tasks: processedTasks, // Ensure processed tasks are saved
              agentId,
              agencyId,
              uniqueId
          });
  
          return res.status(200).json({status:1, message:messages.jobAdded, job: newJob });
      } catch (error) {
          console.error('Error adding job:', error);
          return res.status(500).json({ message:messages.internalServerError });
      }


    },
    ExportJobData:async (req:Request,res:Response) =>{
      try {
        const { jobId } = req.body;
    
        const jobDetails = await Job.findAll({ where: { id: jobId } });
    
        const jobsWithDetails = await Promise.all(
          jobDetails.map(async (job) => {
            const agent = await Agent.findOne({
              where: { agentId: job.agentId },
              attributes: ['fullName', 'image'],
            });
    
            const agency = await Agency.findOne({
              where: { id: job.agencyId },
              attributes: ['Name', 'image', 'Location'],
            });
    
            return {
              JobID: job.id,
              UniqueID: job.uniqueId,
              CustomerName: job.customerName,
              Site: job.site,
              CarNumber: job.carNumber,
              Brand: job.brand,
              Element: job.element,
              DeliveryDate: job.deliveryDate?.toISOString().split('T')[0] || '',
              DeliveryTime: job.deliveryTime || '',
              NewDamage: job.newDamage || '',
              Photos: job.photos?.map(p => p.image).join(', ') || '',
              Tasks: job.tasks?.map(t => t.name).join(', ') || '',
              Status: job.status,
              AgentName: agent?.fullName || '',
              AgentImage: agent?.image || '',
              AgencyName: agency?.Name || '',
              AgencyImage: agency?.image || '',
              AgencyLocation: agency?.Location || ''
            };
          })
        );
    
        const csvWriter = createObjectCsvStringifier({
          header: [
            { id: 'JobID', title: 'Job ID' },
            { id: 'UniqueID', title: 'Unique ID' },
            { id: 'CustomerName', title: 'Customer Name' },
            { id: 'Site', title: 'Site' },
            { id: 'CarNumber', title: 'Car Number' },
            { id: 'Brand', title: 'Brand' },
            { id: 'Element', title: 'Element' },
            { id: 'DeliveryDate', title: 'Delivery Date' },
            { id: 'DeliveryTime', title: 'Delivery Time' },
            { id: 'NewDamage', title: 'New Damage' },
            { id: 'Photos', title: 'Photos' },
            { id: 'Tasks', title: 'Tasks' },
            { id: 'Status', title: 'Status' },
            { id: 'AgentName', title: 'Agent Name' },
            { id: 'AgentImage', title: 'Agent Image' },
            { id: 'AgencyName', title: 'Agency Name' },
            { id: 'AgencyImage', title: 'Agency Image' },
            { id: 'AgencyLocation', title: 'Agency Location' },
          ]
        });
    
        const fileName = `job-details-${Date.now()}.csv`;
        const filePath = path.join(__dirname, '../../uploads', fileName);
        const writableStream = fs.createWriteStream(filePath);
    
        writableStream.write(csvWriter.getHeaderString());
        writableStream.write(csvWriter.stringifyRecords(jobsWithDetails));
        writableStream.end();
    
        writableStream.on('finish', () => {
          const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
          return res.status(200).json({
            status: 1,
            message: 'CSV generated successfully',
            downloadLink: fileUrl,
          });
        });
    
      } catch (error) {
        return res.status(500).json({ status: 0, error: (error as Error).message });
      }
    
 
    },
        ExportAllJobData:async (req:Request,res:Response) =>{
          try {
            const jobs = await Job.findAll();
        
            const enrichedJobs = await Promise.all(
              jobs.map(async (job) => {
                const agent = await Agent.findOne({ where: { agentId: job.agentId } });
                const agency = await Agency.findOne({ where: { id: job.agencyId } });
        
                return {
                  id: job.id,
                  uniqueId: job.uniqueId,
                  customerName: job.customerName,
                  site: job.site,
                  carNumber: job.carNumber,
                  brand: job.brand,
                  element: job.element,
                  deliveryDate: job.deliveryDate?.toISOString().split('T')[0],
                  deliveryTime: job.deliveryTime,
                  newDamage: job.newDamage,
                  Photos: job.photos?.map(p => p.image).join(', ') || '',
                  Tasks: job.tasks?.map(t => t.name).join(', ') || '',
                  agentName: agent?.fullName || '',
                  agencyName: agency?.Name || '',
                  agencyLocation: agency?.Location || '',
                  status: job.status,
                };
              })
            );
        
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Jobs');
        
            worksheet.columns = [
              { header: 'Job ID', key: 'id', width: 10 },
              { header: 'Unique ID', key: 'uniqueId', width: 15 },
              { header: 'Customer Name', key: 'customerName', width: 20 },
              { header: 'Site', key: 'site', width: 15 },
              { header: 'Car Number', key: 'carNumber', width: 15 },
              { header: 'Brand', key: 'brand', width: 15 },
              { header: 'Element', key: 'element', width: 15 },

              { header: 'Delivery Date', key: 'deliveryDate', width: 15 },
              { header: 'Delivery Time', key: 'deliveryTime', width: 15 },
              { header: 'New Damage', key: 'newDamage', width: 20 },


              { header: 'Tasks', key: 'Tasks', width: 30 },
              { header: 'Photos', key: 'Photos', width: 30 },

              { header: 'Agent', key: 'agentName', width: 20 },
              { header: 'Agency', key: 'agencyName', width: 20 },
              { header: 'Location', key: 'agencyLocation', width: 20 },
              { header: 'Status', key: 'status', width: 15 },
            ];
        
            // Apply header style (bold and bigger font)
            worksheet.getRow(1).eachCell((cell) => {
              cell.font = { bold: true, size: 12 };
            });
        
            enrichedJobs.forEach((job) => {
              worksheet.addRow(job);
            });
        
            const fileName = `job-details-${Date.now()}.xlsx`;
            const filePath = path.join(__dirname, '../../uploads', fileName);
            await workbook.xlsx.writeFile(filePath);
        
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
            return res.status(200).json({
              status: 1,
              message: 'Excel exported successfully with formatting',
              fileUrl,
            });
          } catch (error) {
            return res.status(500).json({ status: 0, error: (error as Error).message });
          }


          // try {
          //   const jobs = await Job.findAll();
        
          //   const enrichedJobs = await Promise.all(
          //     jobs.map(async (job) => {
          //       const agent = await Agent.findOne({ where: { agentId: job.agentId } });
          //       const agency = await Agency.findOne({ where: { id: job.agencyId } });
        
          //       return {
          //         id: job.id,
          //         uniqueId: job.uniqueId,
          //         customerName: job.customerName,
          //         site: job.site,
          //         carNumber: job.carNumber,
          //         brand: job.brand,
          //         element: job.element,
          //         deliveryDate: job.deliveryDate?.toISOString().split('T')[0],
          //         deliveryTime: job.deliveryTime,
          //         newDamage: job.newDamage,
          //         agentName: agent?.fullName || '',
          //         agencyName: agency?.Name || '',
          //         agencyLocation: agency?.Location || '',
          //         status: job.status,
          //       };
          //     })
          //   );
        
          //   const csvWriter = createObjectCsvStringifier({
          //     header: [
          //       { id: 'id', title: 'Job ID' },
          //       { id: 'uniqueId', title: 'Unique ID' },
          //       { id: 'customerName', title: 'Customer Name' },
          //       { id: 'site', title: 'Site' },
          //       { id: 'carNumber', title: 'Car Number' },
          //       { id: 'brand', title: 'Brand' },
          //       { id: 'element', title: 'Element' },
          //       { id: 'deliveryDate', title: 'Delivery Date' },
          //       { id: 'deliveryTime', title: 'Delivery Time' },
          //       { id: 'newDamage', title: 'New Damage' },
          //       { id: 'agentName', title: 'Agent' },
          //       { id: 'agencyName', title: 'Agency' },
          //       { id: 'agencyLocation', title: 'Location' },
          //       { id: 'status', title: 'Status' },
          //     ],
          //   });
        
          //   const fileName = `job-details-${Date.now()}.csv`;
          //   const filePath = path.join(__dirname, '../../uploads', fileName);
          //   const writableStream = fs.createWriteStream(filePath);
        
          //   writableStream.write(csvWriter.getHeaderString());
          //   writableStream.write(csvWriter.stringifyRecords(enrichedJobs));
          //   writableStream.end();
        
          //   // ✅ Handle stream completion
          //   writableStream.on('finish', () => {
          //     const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
          //     return res.status(200).json({
          //       status: 1,
          //       message: 'CSV exported successfully',
          //       fileUrl,
          //     });
          //   });
        
          //   // ❌ Catch stream errors too
          //   writableStream.on('error', (err) => {
          //     return res.status(500).json({ status: 0, error: 'File writing failed: ' + err.message });
          //   });
          // } catch (error) {
          //   return res.status(500).json({ status: 0, error: (error as Error).message });
          // }


  
  },
  Dashboard:async (req:Request,res:Response) =>{
try {
    const { messages } = req as any;
    const { startOfToday, startOfWeek, startOfMonth, startOfYear } = getTimeRanges();

    const [
      // Customer Counts
      todayCustomers,
      weeklyCustomers,
      monthlyCustomers,
      yearlyCustomers,

      // Agency Counts
      todayAgencies,
      weeklyAgencies,
      monthlyAgencies,
      yearlyAgencies,

      todayAgents,
      weeklyAgents,
      monthlyAgents,
      yearlyAgents,

      // Job Counts
      totalActiveJobs,
      todayJobs,
      weeklyJobs,
      monthlyJobs,
      yearlyJobs,

      // Agent Counts


      // Support Counts
      todaySupport,
      weeklySupport,
      monthlySupport,
      yearlySupport
    ] = await Promise.all([
      // Customers
      customer.count({ where: { createdAt: { [Op.gte]: startOfToday } } }),
      customer.count({ where: { createdAt: { [Op.gte]: startOfWeek } } }),
      customer.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      customer.count({ where: { createdAt: { [Op.gte]: startOfYear } } }),

      // Agencies
      Agent.count({ where: { createdAt: { [Op.gte]: startOfToday } } }),
      Agent.count({ where: { createdAt: { [Op.gte]: startOfWeek } } }),
      Agent.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      Agent.count({ where: { createdAt: { [Op.gte]: startOfYear } } }),

      Agency.count({ where: { createdAt: { [Op.gte]: startOfToday } } }),
      Agency.count({ where: { createdAt: { [Op.gte]: startOfWeek } } }),
      Agency.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      Agency.count({ where: { createdAt: { [Op.gte]: startOfYear } } }),


      // Jobs
      Job.count({ where: { status: "active" } }),
      Job.count({ where: { createdAt: { [Op.gte]: startOfToday as Date } } }),
      Job.count({ where: { createdAt: { [Op.gte]: startOfWeek } } }),
      Job.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      Job.count({ where: { createdAt: { [Op.gte]: startOfYear } } }),

      // Support
      Support.count({ where: { createdAt: { [Op.gte]: startOfToday } } }),
      Support.count({ where: { createdAt: { [Op.gte]: startOfWeek } } }),
      Support.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      Support.count({ where: { createdAt: { [Op.gte]: startOfYear } } }),
    ]);

    res.status(200).json({
      status: 1,
      message: messages.dashboardGet,
      data: {
        customers: {
          today: todayCustomers,
          week: weeklyCustomers,
          month: monthlyCustomers,
          year: yearlyCustomers
        },
        agencies: {
          today: todayAgencies,
          week: weeklyAgencies,
          month: monthlyAgencies,
          year: yearlyAgencies
        },
        agents: {
          today: todayAgents,
          week: weeklyAgents,
          month: monthlyAgents,
          year: yearlyAgents
        },
        jobs: {
          active: totalActiveJobs,
          today: todayJobs,
          week: weeklyJobs,
          month: monthlyJobs,
          year: yearlyJobs
        },
        support: {
          today: todaySupport,
          week: weeklySupport,
          month: monthlySupport,
          year: yearlySupport
        }
      }
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({
      status: 0,
      message: (req as any).messages?.internalServerError || "Internal Server Error"
    });
  }
  }


}
