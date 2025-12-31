const express = require("express") 
const cors = require("cors") 
const mongoose = require("mongoose")
const nodemailer = require("nodemailer"); //Install nodemailer 
require("dotenv").config();

const app = express() 
app.use(cors({
  origin: "https://bulkmail-frontend-vkce.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection failed:", err));

const credential = mongoose.model("credential", {}, "bulkmail");

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
      host: "smtp.gmail.com",
      auth: {
        user: data[0].user,
        pass: data[0].pass, // GMAIL APP PASSWORD
      },
    });
    
    for (const email of emaillist) {
      await transporter.sendMail({
        from: data[0].user,
        to: email,
        subject: subject,
        text: msg,
      });
    }

    console.log("Emails sent successfully");
    res.send(true);

  } catch (error) {
    console.error("EMAIL SEND ERROR:", error);
    res.send(false);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});