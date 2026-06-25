 //as file is saved server restarted
//  require ("dotenv").config({path:"./env"})//it is responsible for loading environment variables from a .env file into process.env;
import dotenv from "dotenv";
import connectToDatabase from "./db/index.js"; 
dotenv.config({
    path: "./env"
});




// dotenv.config();

// import express from "express";
// const app = express();



 ////database connection method 1

//  ;(async () => {
//    try {
//      const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//      console.log("MongoDB connected successfully");
//      //listener
//      app.on("error", (err) => {
//        console.error("Error connecting to MongoDB:", err);
//        throw err;
//      });
//      app.listen(process.env.PORT, () => {
//        console.log(`Server is running on port ${process.env.PORT}`);
//      });
//    } catch (error) {
//      console.error("Error connecting to MongoDB:", error);
//      throw error;
//    }
//  })();


connectToDatabase()

