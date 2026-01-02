const express = require("express") 
const cors = require("cors") 

const nodemailer = require("nodemailer"); //Install nodemailer 
require("dotenv").config();

const app = express() 
app.use(cors({
  origin: "https://bulkmail-frontend-vkce.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json())



app.get('/',(req,res)=>{
    res.send("Bulk mail backend service is running");
})

app.post("/sendemail", async (req, res) => {
  try {
    const { subject, msg, emaillist } = req.body;

    if (!subject || !msg || !emaillist || !emaillist.length) {
      return res.status(400).send(false);
    }

    const { GMAIL_USER, GMAIL_PASS } = process.env;
    if (!GMAIL_USER || !GMAIL_PASS) 
      return res.status(500).json({ success: false, error: "Gmail credentials not set" });
    

    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS, // GMAIL APP PASSWORD
      },
    });
    
    for (const email of emaillist) {
      await transporter.sendMail({
        from:GMAIL_USER,
        to: email,
        subject: subject,
        text: msg,
      });
    }

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