import { Router } from "express";
import { checkUser, login ,logout,refreshToken,ping, checkStatus } from "../controllers/authController";
import authenticate from "../middleware/authenticate";

const router = Router();

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/check-user',checkUser);
router.get('/ping', authenticate, ping);
router.get('/status',authenticate,checkStatus )

export default router;