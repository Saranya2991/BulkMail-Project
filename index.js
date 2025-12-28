const express = require("express") 
const cors = require("cors") 
const mongoose = require("mongoose")
const nodemailer = require("nodemailer"); //Install nodemailer 
require("dotenv").config();

const app = express() 
app.use(cors({
  origin: "https://bulk-mail-frontend-29im.vercel.app",
  credentials: true,
}));
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
const Credential = mongoose.model("Credential", credentialSchema, "bulkmail");

app.post("/sendemail", async(req, res)=>{
    var msg = req.body.msg 
    console.log(msg) 
    var emaillist = req.body.emaillist 
    var subject = req.body.subject

if (!msg || !subject || !emaillist?.length) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }


    try {
    // Get sender credentials
    const data = await Credential.find();
    if (!data.length) {
      return res.status(400).json({ success: false, error: "No credentials found" });
    }
        //console.log(data[0].toJSON) 
        // Create a test account or replace with real credentials.
        const transporter = nodemailer.createTransport({ 
            service:"gmail", 
            auth: { 
                user: data[0].user, 
                pass: data[0].pass 
            }, 
        });
       // Send all emails in parallel
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

    res.json({ success: true });
       } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
            const PORT = process.env.PORT || 5000

            
  app.listen(PORT, () => {
    console.log("Server Started...");
  });

            console.log("running in port",PORT)