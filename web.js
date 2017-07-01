#!/usr/bin/env node

var express = require("express");
var app = express();
var Spooky = require('spooky');
var linkbot = require("./showlinks.js");
var showsbot = require("./shows.js");

linkbot.fetch(5);

setTimeout(function(){
    showsbot.fetch(linkbot.links()); 
}, 7000);


app.use(express.logger());

app.get('/links', function(request, response) {
    if (!linkbot.links()){
        showsbot.fetch(linkbot.links()); 
    }
    response.send(showsbot.shows());
});

app.get('/', function(request, response) {
    if (!linkbot.links()){
        showsbot.fetch(linkbot.links()); 
    }
    response.send(showsbot.shows());
});

app.get('/:rows', function(request, response) {
    linkbot.fetch(request.params.rows);
    response.send();
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});