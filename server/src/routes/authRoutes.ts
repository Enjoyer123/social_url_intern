import { Router } from "express";
// const Router = require("express")

import { checkUser, getProtected, login, verifyToken , checkLogin ,logout,refreshToken,ping } from "../controllers/authController";
import authenticate from "../middleware/authenticate";


const router = Router();

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/check-user',checkUser);
router.post('/verify-token', authenticate, verifyToken);
router.get('/check-login',  checkLogin);
router.get('/ping', authenticate, ping);

// Protected route
router.get("/protected", authenticate ,getProtected);


export default router;