const express = require("express") 
const cors = require("cors") 
const mongoose = require("mongoose")
const nodemailer = require("nodemailer"); //Install nodemailer 
require("dotenv").config();

const app = express() 
// ===== CORS =====
const corsOptions = {
  origin: "https://bulk-mail-frontend-29im.vercel.app", // exact frontend URL
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store"); // Prevent caching
  next();
});

app.use(express.json())



mongoose.connect(process.env.MONGODB_URI) //passkey DB name 
.then(function(){ 
    console.log("Connected to DB") 
}).catch(function(){ 
    console.log("Failed to Connect") 
})


const credentialSchema = new mongoose.Schema({
    user: String,
    pass: String
});
const credential = mongoose.model("credential", credentialSchema, "bulkmail");

app.post("/sendemail",async(req, res)=>{
    var msg = req.body.msg 
    console.log(msg) 
    var emaillist = req.body.emaillist 
    var subject = req.body.subject
    if (!msg || !emaillist || !subject) {
    return res.status(400).send("Missing required fields");
  }
    try{
        const data = await Credential.find();
    if (!data.length) return res.status(500).send("No email credentials found");

        //console.log(data[0].toJSON) 
        // Create a test account or replace with real credentials.
        const transporter = nodemailer.createTransport({ 
            service:"gmail", 
            auth: { 
                user: data[0].toJSON().user, 
                pass: data[0].toJSON().pass, 
            }, 
        });
        await Promise.all(
      emaillist.map(email =>
        transporter.sendMail({
          from: data[0].user,
          to: email,
          subject,
          text: msg,
        })
      )
    );

    res.send(true);
  } catch (error) {
    console.error("Error sending emails:", error);
    res.send(false);
  }
});
            const PORT = process.env.PORT || 5000

            
  app.listen(PORT, () => {
    console.log("Server Started...");
  });

            console.log("running in port",PORT)