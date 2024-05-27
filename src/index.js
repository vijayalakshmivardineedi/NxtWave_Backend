const express=require("express")
const env = require('dotenv')
const mongoose=require("mongoose")
const app=express()
const path=require('path');
const cors =require('cors')



//routes
const userRoute = require("./routes/user");
const resourceRoute = require("./routes/resource");


  
env.config()
mongoose.connect(
  `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.jowi51t.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`,
  
  {  
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => {
  console.log("Database Connected");
})
.catch((err) => {
  console.error("Error connecting to the database:", err);
});
app.use(cors());
app.use(express.json());
app.use('/api', resourceRoute);
app.use('/api', userRoute);

app.listen(2000,()=>{
    console.log(`Server is runnung on Port 2000`)
});
