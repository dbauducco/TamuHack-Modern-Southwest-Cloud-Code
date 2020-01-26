const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();
const admin = require('firebase-admin');
const twilio = require('twilio');

// Twilio Info
const accountSid = '*******************'; // Your Account SID from www.twilio.com/console
const authToken = '********************';   // Your Auth Token from www.twilio.com/console

const client = new twilio(accountSid, authToken);


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Initialize admin
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

// GET and POST Code
app.get('/', (req, res) => {
  // Not using GET for now
  console.log("Got GET!");
  res.end("Received GET request!"); 
});

app.post('/', (req, res) => {

  // Get x-www-form-urleconded data
  let data = req.body;
    
  let payload = 
  {
      notification: {
         title: 'Luggage Alert',
         body: 'Hello! ' + data.bagName + ' now has a status of: ' + data.status,
         sound: 'default',
         badge: '1'
      }
  };
  
  let tokens = [];
  tokens.push("cwNkOvflKgY:APA91bGNfNP9EMpG6JZfZvtkB6Nwd_gGq3RFaIiGqLXgUxYMGFbOGRz5et7StisnBpYMo5-v7HtarBtN2-yIWYhvpHMUX3GZGAQl6KmjGtDPydxceel2EWVUbzaKHMUsQmDLCfMPzHMp");
    
    
  admin.messaging().sendToDevice(tokens, payload);
    
  client.messages.create({
            body: 'Hello! ' + data.bagName + ' now has a status of: ' + data.status,
            to: '+18327127730',  // Text this number
            from: '+12054028369' // From a valid Twilio number
        })
  .then((message) => {
      
      // Create and post bag reference
      var bagRef = db.collection('bags').doc(data.id);
      let newBagData = {
          status: data.status,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          name: data.bagName,
          weight: data.weight
      }
      bagRef.set(newBagData);

      // Create and post checkpoint
      var checkpointRef = db.collection('bags').doc(data.id).collection('checkpoints');
      let newCheckpoint = {
          status: data.status,
          time: admin.firestore.FieldValue.serverTimestamp(),
          deviceId: data.deviceId
      }
      checkpointRef.add(newCheckpoint);
      
  });
    
  // Ending
  return res.end("Success!");
    
});

// Expose Express API as a single Cloud Function:
exports.update = functions.https.onRequest(app);

