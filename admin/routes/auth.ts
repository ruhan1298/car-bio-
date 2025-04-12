import express, { Router, Request, Response } from 'express';
const router: Router = express.Router();
// import UserAuth from '../../middleware/UserAuth';
import authController from '../../admin/controller/auth'
// import upload from '../../middleware/upload'
import userAuth from '../../middleware/userAuth';
import upload from '../../middleware/upload';
import languageMiddleware from '../../middleware/languagemiddleware';
// import { UserAuth } from '../../middleware/userAuth';


router.post("/Login", languageMiddleware,(req: Request, res: Response) => {
    authController.AdminLogin(req, res);
  });
  router.get("/get-admin",userAuth, (req: Request, res: Response) => {
    authController.GetAdmin(req, res);
  });
  router.post("/update-admin",upload.single('image'),userAuth, (req: Request, res: Response) => {
    authController.UpdateAdmin(req, res);
  });
  router.post("/change-pass",userAuth, (req: Request, res: Response) => {
    authController.ChangePass(req, res);
  });
  router.post("/otp-verify", (req: Request, res: Response) => {


    authController.OtpVerify(req, res);
  });
  router.post("/update-password", (req: Request, res: Response) => {


    authController.UpdatePassword(req, res);
  })
  
  router.post("/forget-password",languageMiddleware, (req: Request, res: Response) => {


    authController.ForgetPassword(req, res);
  });

  router.post("/add-agent",languageMiddleware, (req: Request, res: Response) => {


    authController.AgentAdd(req, res);
  })
  
  router.get("/get-agent",languageMiddleware, (req: Request, res: Response) => {
    authController.GetAgent(req, res);
  });
  router.post("/update-agency",languageMiddleware,upload.single('image'), (req: Request, res: Response) => {
    authController.UpdateAgency(req, res);
  });
  router.get("/get-agency",languageMiddleware, (req: Request, res: Response) => {
    authController.GetAgency(req, res);
  });
  router.post("/add-agency",languageMiddleware,upload.single('image'), (req: Request, res: Response) => {
    authController.AddAgency(req, res);
  });
  router.post("/delete-agency", (req: Request, res: Response) => {
    authController.DeleteAgency(req, res);
  });
  router.post("/add-customer",languageMiddleware,upload.single('image'), (req: Request, res: Response) => {
    authController.AddCustomer(req, res);
  });
  router.post("/get-customer",languageMiddleware, (req: Request, res: Response) => {
    authController.GetCustomer(req, res);
  });
  router.post("/update-customer",languageMiddleware,upload.single('image'), (req: Request, res: Response) => {
    authController.UpdateCustomer(req, res);
  });
  router.post("/delete-customer", languageMiddleware,(req: Request, res: Response) => {
    authController.DeleteCustomer(req, res);
  });
  router.post("/add-masterdata", (req: Request, res: Response) => {
    authController.AddMasterData(req, res);
  });
  router.post("/update-masterdata,", (req: Request, res: Response) => {
    authController.UpdateMasterData(req, res);
  });
  router.post("/get-job",languageMiddleware, (req: Request, res: Response) => {
    authController.GetJob(req, res);
  });
  router.post("/job-details",languageMiddleware, (req: Request, res: Response) => {
    authController.jobDetails(req, res);
  });
  router.post("/job-delete",languageMiddleware, (req: Request, res: Response) => {
    authController.JobDelete(req, res);
  });
  router.post("/get-support",languageMiddleware, (req: Request, res: Response) => {
    authController.GetSupport(req, res);
  });
  router.post("/reply-support",languageMiddleware, (req: Request, res: Response) => {
    authController.ReplySupport(req, res);
  });
  export default router