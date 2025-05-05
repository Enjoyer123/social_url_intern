import express ,{Request,Response}from "express";
import {Express} from "express";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes"
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const port = 8000;
import cors from "cors";


app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());


app.use('/user', userRoutes);
app.use('/auth', authRoutes);



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});