#!/usr/bin/env node
require('dotenv').config();
var express = require("express");
var app = express();
var scrapy = require('./scrapy.js');
var awin = require('./awin.js');

var db = require("./db.js");

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
	}, 25000);
}

var getIndividuals = function (links){
    console.log('================ Starting Individual.. ================')
    
    links.forEach(function(link){
        scrapy.getShow(link);
    });
}

awin.fetch();
fetch();