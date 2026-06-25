import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
dotenv.config();
// Database connection method 2
//databse is in another continent
const connectToDatabase = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log("MongoDB connected successfully", connectionInstance.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB ||failed connection:", error);
    // throw error;//(exit process)
    // When JavaScript encounters throw, it immediately stops normal execution of the current function and looks for a catch block to handle the error.
    
process.exit(1); // Exit the process with a failure code




  }     
}

export default connectToDatabase