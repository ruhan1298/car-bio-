import express, { Router, Request, Response } from 'express';
const router: Router = express.Router();
// import UserAuth from '../../middleware/UserAuth';
import agentAuthController from '../../Agent/controller/agentAuth'
// import upload from '../../middleware/upload'
import userAuth from '../../middleware/userAuth';
import upload from '../../middleware/upload';
// import { UserAuth } from '../../middleware/userAuth';
import languageMiddleware from '../../middleware/languagemiddleware';

router.post("/Login", languageMiddleware,(req: Request, res: Response) => {
    agentAuthController.AgentLogin(req, res);
  });
  router.get("/get-agent",languageMiddleware,userAuth, (req: Request, res: Response) => {
    agentAuthController.GetProfile(req, res);
  });
  router.get("/get-agecny",languageMiddleware,userAuth, (req: Request, res: Response) => {
    agentAuthController.GetAgency(req, res);
  });
  router.post("/update-agent",languageMiddleware,upload.single('image'),userAuth, (req: Request, res: Response) => {
    agentAuthController.UpdateAgentProfile(req, res);
  });
  router.post("/change-pass",languageMiddleware,userAuth, (req: Request, res: Response) => {
    agentAuthController.ChangePass(req, res);
  });  
  router.post("/otp-verify",languageMiddleware, (req: Request, res: Response) => {


    agentAuthController.OtpVerify(req, res);
  });
  router.post("/update-password",languageMiddleware, (req: Request, res: Response) => {


    agentAuthController.UpdatePassword(req, res);
  })
  
  router.post("/forget-password",languageMiddleware, (req: Request, res: Response) => {


    agentAuthController.ForgetPassword(req, res);
  });
  router.post("/add-job",languageMiddleware,upload.array('photos'),userAuth, (req: Request, res: Response) => {


    agentAuthController.AddJob(req, res);
  });
  router.post("/update-job",languageMiddleware,upload.array('photos'),userAuth, (req: Request, res: Response) => {


    agentAuthController.UpdateJob(req, res);
  });
  router.post("/my-job",languageMiddleware,userAuth, (req: Request, res: Response) => {


    agentAuthController.MyJOb(req, res);
  });
  router.post("/complete-job",languageMiddleware,userAuth, (req: Request, res: Response) => {


    agentAuthController.CompleteJob(req, res);
  });
  router.post("/get-masterdata",languageMiddleware,userAuth, (req: Request, res: Response) => {


    agentAuthController.GetMasterData(req, res);
  });
  
  router.post("/get-customer",languageMiddleware,userAuth, (req: Request, res: Response) => {


    agentAuthController.GetCustomer(req, res);
  });
  
  router.post("/add-support",languageMiddleware,userAuth, (req: Request, res: Response) => {


    agentAuthController.SupprtAdd(req, res);
  });
  
  router.post("/get-agency",languageMiddleware,userAuth, (req: Request, res: Response) => {


    agentAuthController.AgencyGet(req, res);
  });

  router.post("/start-job",languageMiddleware,upload.array('photos'),userAuth, (req: Request, res: Response) => {


    agentAuthController.SartJob(req, res);
  });

  router.post("/get-customerdata",languageMiddleware,userAuth, (req: Request, res: Response) => {


    agentAuthController.GetcustomerData(req, res);
  });
  
router.post("/language-change",languageMiddleware,userAuth, (req: Request, res: Response) => {
    agentAuthController.LanguageChange(req, res); 

})

  export default router;