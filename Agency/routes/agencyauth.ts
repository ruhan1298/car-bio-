import express, { Router, Request, Response } from 'express';
const router: Router = express.Router();
// import UserAuth from '../../middleware/UserAuth';
import agencyController from '../../Agency/controller/agencyauth'
// import upload from '../../middleware/upload'
import userAuth from '../../middleware/userAuth';
import upload from '../../middleware/upload';
import languageMiddleware from '../../middleware/languagemiddleware';
// import { UserAuth } from '../../middleware/userAuth';
router.post("/Login", languageMiddleware,(req: Request, res: Response) => {
    agencyController.AgencyLogin(req, res);
  });
  router.get("/get-profile",languageMiddleware,userAuth, (req: Request, res: Response) => {
    agencyController.GetAgency(req, res);
  });
  router.post("/update-agency",languageMiddleware,upload.single('image'),userAuth, (req: Request, res: Response) => {
    agencyController.UpdateAgency(req, res);
  });
  router.post("/change-pass",languageMiddleware,userAuth, (req: Request, res: Response) => {
    agencyController.ChangePass(req, res);
  });
  router.post("/otp-verify",languageMiddleware, (req: Request, res: Response) => {


    agencyController.OtpVerify(req, res);
  });
  router.post("/update-password",languageMiddleware, (req: Request, res: Response) => {


    agencyController.UpdatePassword(req, res);
  })
  
  router.post("/forget-password",languageMiddleware, (req: Request, res: Response) => {


    agencyController.ForgetPassword(req, res);
  });




export default router