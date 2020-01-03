const functions = require('firebase-functions');
const express = require('express');

const app = express();
app.get('/api/japan', (request, response) => {
  const res = {"country": "Japan"}
  response.send(res);
})

app.get('/api/australia', (request, response) => {
  const res = {"country": "Australia"}
  response.send(res);
})

exports.app = functions.https.onRequest(app);

