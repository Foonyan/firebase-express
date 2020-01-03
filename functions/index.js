const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors')
const app = express();
app.use(cors())

var serviceAccount = require("./foonyansample-firebase-adminsdk-bbrr1-738e207fc4");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();
var docRef = db.collection('foonyan').doc('test');

app.get('/api/country', (request, response) => {
  var res;
  res = docRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        console.log('Document data:', doc.data());
        response.send(doc.data());
      }
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
})

app.post('/api/country', (request, response) => {
  var res;
  console.log(request.body);
  docRef.set(request.body);
  response.send(res);
})

exports.app = functions.https.onRequest(app);

