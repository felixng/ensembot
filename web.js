#!/usr/bin/env node
var express = require("express");
var app = express();
var scrapy = require('./scrapy.js');

var db = require("./db.js");

scrapy.getShow();

var fetch = function (){
	var spooky = require("./spooky.js");
	spooky.fetch(200);		

	setTimeout(function(){
		var result = {
			date: Date()
		}
		result.links = spooky.links();
		db.logLinks(result);

		getIndividuals(result.links);
	}, 20000);
}

var getIndividuals = function (links){
    console.log('================ Starting Individual.. ================')
    
    links.forEach(function(link){
        scrapy.getShow(link);
    });
}

app.use(express.logger());

app.get('/fetch', function(request, response) {
    fetch();
    response.send();
});

app.get('/', function(request, response) {
    response.send();
});

// app.get('/:rows', function(request, response) {
//     linkbot.fetch(request.params.rows);
//     response.send();
// });

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});