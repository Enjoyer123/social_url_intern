import { Router } from "express";
import { getAllUsers ,getMe,createProfile} from "../controllers/userController";
import authenticate from "../middleware/authenticate";
import { createAccessLink, createTasks, getAccessLinks, getCurrentRound, getNextStaff, getTasks, getUsers, startNewRound } from "../controllers/qController";

const router = Router();

router.get("/", getAllUsers)
router.get("/me",authenticate,getMe) 
router.post("/create-profile", createProfile)

router.get('/users', getUsers);
router.get('/next-staff', getNextStaff);

router.get('/tasks', getTasks);
router.post('/tasks', createTasks);
router.get('/current-round', getCurrentRound);
router.post('/new-round', startNewRound);


router.post('/access-links', createAccessLink);
router.get('/access-links', getAccessLinks);

export default router;