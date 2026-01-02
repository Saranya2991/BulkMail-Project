const express = require("express") 
const cors = require("cors") 
const mongoose = require("mongoose")
const nodemailer = require("nodemailer"); //Install nodemailer 
require("dotenv").config();

const app = express() 
app.use(cors({
  origin: "https://bulkmail-frontend-vkce.onrender.com",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));


app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection failed:", err));

const Credential = mongoose.model("credential", {}, "bulkmail");

app.get('/',(req,res)=>{
    res.send("Bulk mail backend service is running");
})

app.post("/sendemail", async (req, res) => {
  try {
    const { subject, msg, emaillist } = req.body;

    if (!subject || !msg || !emaillist || !emaillist.length) {
      return res.status(400).send(false);
    }

    const data = await Credential.find();
    if (!data.length) {
      console.error("No email credentials found in DB");
      return res.status(500).send(false);
    }

    
    const transporter = nodemailer.createTransport({
      service:"gmail",
      host: "smtp.gmail.com",
       port: 465,
      secure: true,
      auth: {
        user: data[0].user,
        pass: data[0].pass, // GMAIL APP PASSWORD
      },connectionTimeout: 10000,
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

    console.log("Emails sent successfully");
    res.json(true);

  } catch (error) {
    console.error("EMAIL SEND ERROR:", error);
    res.json(false);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});