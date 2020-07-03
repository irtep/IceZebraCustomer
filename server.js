// IceZebra Chat Clients CUI server 0.0.1
const app = require('express')();
const express = require('express');
const http = require('http').Server(app);
const port = 6767;

app.use(express.static('customerUI'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// listen from www
http.listen(port, () => {
  console.log('listening on *:' + port);
});
