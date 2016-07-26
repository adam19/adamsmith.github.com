// Basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 3000;

server.listen(port, function() {
	console.log("Server is listening on port " + port);
});

// Routing
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/node_modules'));

