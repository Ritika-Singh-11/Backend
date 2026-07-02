// console.log("🚀 APP.JS LOADED");
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'//we can take any name when export is default

app.use((req, res, next) => {
    // console.log("Content-Type:", req.headers["content-type"]);
    next();
});


// console.log("Before app.use");
 app.use("/api/v1/users", userRouter);

// console.log("After app.use");//
// http://localhost:8000/api/v1/users/register

export default app


