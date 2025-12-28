const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

let isConnected = false;

// --- Connect to MongoDB ---
const connectToDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
};

// --- Schema ---
const credentialSchema = new mongoose.Schema({
  user: String,
  pass: String,
});
const Credential = mongoose.models.Credential || mongoose.model("Credential", credentialSchema, "bulkmail");

// --- Helper: send emails in batches ---
const sendEmailsInBatches = async (emails, batchSize, transporter, from, subject, msg) => {
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    await Promise.all(
      batch.map(email =>
        transporter.sendMail({
          from,
          to: email,
          subject,
          text: msg,
        })
      )
    );
  }
};

// --- Serverless handler ---
module.exports = async (req, res) => {
  try {
    // Only POST
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "https://bulk-mail-frontend-29im.vercel.app");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, X-Requested-With, Accept"
    );

    // Preflight
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const { msg, emaillist, subject } = req.body;

    if (!msg || !subject || !emaillist?.length) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    await connectToDB();
    const data = await Credential.find();
    if (!data.length) return res.status(400).json({ success: false, error: "No credentials in DB" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: data[0].user, pass: data[0].pass },
    });

    // Send emails in batches of 50
    await sendEmailsInBatches(emaillist, 50, transporter, data[0].user, subject, msg);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Send email error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
