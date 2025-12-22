const express = require("express") 
const cors = require("cors") 
const mongoose = require("mongoose")
const nodemailer = require("nodemailer"); //Install nodemailer 
require("dotenv").config();

const app = express() 
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://bulk-mail-frontend-29im.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type: application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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

app.post("/sendemail",function(req, res){
    var msg = req.body.msg 
    console.log(msg) 
    var emaillist = req.body.emaillist 
    var subject = req.body.subject

    credential.find().then(function(data){
        //console.log(data[0].toJSON) 
        // Create a test account or replace with real credentials.
        const transporter = nodemailer.createTransport({ 
            service:"gmail", 
            auth: { 
                user: data[0].toJSON().user, 
                pass: data[0].toJSON().pass, 
            }, 
        });
        new Promise( async function(resolve,reject) {
             try 
             { 
                for(var i=0; i<emaillist.length; i++) 
                    { 
                        await transporter.sendMail( 
                            { 
                                from:"saara2991@gmail.com",
                                to:emaillist[i], 
                                subject:subject, 
                                text:msg, 
                            } ) 
                            
                           //console.log("Email sent to:"+emaillist[i]) 
                        } 
                        resolve("Success") 
                    }
                    catch(error) 
                    { 
                        reject("Failed")
                    } 
                    }).then(function(){ 
                        res.send(true) 
                    }).catch(function(){ 
                        res.send(false) 
                    }) 
                }).catch(function(error){ 
                    console.log(error) 
                }) 
            })

            const PORT = process.env.PORT || 5000

            if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log("Server Started...");
  });
}
            console.log("running in port",PORT)