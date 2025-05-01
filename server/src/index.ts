import express ,{Request,Response}from "express";
import {Express} from "express";
// import morgan from "morgan";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes"
import cookieParser from "cookie-parser";

const app: Express = express();
const port = 8000;
import cors from "cors";
// กำหนดให้สามารถเข้าถึงจากทุก origin หรือจาก origin เฉพาะ
app.use(cors({
  origin: 'http://localhost:3000', // ระบุโดเมนที่คุณอนุญาต
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // เพิ่ม 'X-Requested-With'
  credentials: true, // เพื่อให้คุกกี้ส่งไปได้
}));


app.use(express.json());
app.use(cookieParser());
// app.use(morgan('dev'))

// API ที่จะใช้ทดสอบ

// routes
app.use('/user', userRoutes);
app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});