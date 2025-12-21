const express = require("express") 
const cors = require("cors") 
const mongoose = require("mongoose")
const nodemailer = require("nodemailer"); //Install nodemailer 
require("dotenv").config();

const app = express() 
// Custom CORS middleware to set additional headers
const customCors = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Use specific origin in production
  // Another common pattern: Allow dynamic origin
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Proceed to next middleware or route
  next();
};

// Apply built-in CORS middleware (allowing all origins in this case)
app.use(cors());

// Apply custom CORS middleware for additional headers
app.use(customCors);


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

            app.listen(PORT, function(){ 
                console.log("Server Started.....") 
            })
            console.log("running in port",PORT)