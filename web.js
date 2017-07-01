#!/usr/bin/env node

var express = require("express");
var app = express();
var Spooky = require('spooky');
var ensembot = require("./showlinks.js");

ensembot.fetch(10);

app.use(express.logger());
app.get('/', function(request, response) {
    response.send(ensembot.links());
});

app.get('/:rows', function(request, response) {
    ensembot.fetch(request.params.rows);
    response.send();
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});