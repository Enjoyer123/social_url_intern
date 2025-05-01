import { Router } from "express";
import { getAllUsers ,getMe,createProfile,test} from "../controllers/userController";
import authenticate from "../middleware/authenticate";

const router = Router();

// Example route
router.get("/", getAllUsers)
router.get("/me",authenticate,getMe) 
router.post("/create-profile", createProfile)

router.get('/test-access-token' ,test)
  
export default router;