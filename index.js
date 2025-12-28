const express = require("express") 
const cors = require("cors") 
const mongoose = require("mongoose")
const nodemailer = require("nodemailer"); //Install nodemailer 
require("dotenv").config();

const app = express(); 
app.use(cors({
  origin: "https://bulk-mail-frontend-29im.vercel.app",
  credentials: true,
}));
app.use(express.json());
let isConnected = false;
mongoose.connect(process.env.MONGODB_URI) //passkey DB name 
.then(function(){ 
    console.log("Connected to DB") 
    isConnected = true;
}).catch(function(err){ 
    console.log("Failed to Connect",err) 
})


const credentialSchema = new mongoose.Schema({
    user: String,
    pass: String
});
const Credential = mongoose.model("credential", credentialSchema, "bulkmail");


    
app.post("/sendemail", async (req, res) => {
    var msg = req.body.msg 
    console.log(msg) 
    var emaillist = req.body.emaillist 
    var subject = req.body.subject
  try {
    const { msg, emaillist, subject } = req.body

    if (!msg || !subject || !emaillist?.length) {
      return res.json({ success: false, error: "Missing fields" })
    }

    const data = await Credential.find()
   if (!data.length) return res.json({ success: false, error: "No credentials in DB" })

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].user,
        pass: data[0].pass // Must be Gmail App Password
      },
    })

    // Send emails in parallel
    await Promise.all(
      emaillist.map(email =>
        transporter.sendMail({
          from: data[0].user,
          to: email,
          subject: subject,
          text: msg,
        })
      )
    )

    return res.json({ success: true })
  } catch (error) {
    console.error("Send email error:", error)
     return res.json({ success: false, error: error.message })
            }
})

            const PORT = process.env.PORT || 5000

            
  app.listen(PORT, () => {
    console.log("Server Started...");
  });

            console.log("running in port",PORT)

            module.exports = app
