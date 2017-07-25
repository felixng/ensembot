const request = require('request');
const http = require("http");
const url = require("url");
const JSZip = require("jszip");
const csv = require('csvtojson');
const db = require("./db.js");
const getSymbolFromCurrency = require('currency-symbol-map');
var awinFeed = process.env.AWIN_FEED_URL || '';

function fetchAffiliate(){ 
	if (awinFeed == '') {
		console.log('Error getting AWIN_FEED_URL!');
		return;
	}

	var req = http.get(url.parse(awinFeed), function (res) {
	  if (res.statusCode !== 200) {
	    console.log(res.statusCode);
	    return;
	  }
	  var data = [], dataLen = 0;

	  res.on("data", function (chunk) {
	    data.push(chunk);
	    dataLen += chunk.length;
	  });

	  res.on("end", function () {
	    var buf = Buffer.concat(data);

	    JSZip.loadAsync(buf).then(function (zip) {
	    	var filename = zip.files[Object.keys(zip.files)[0]].name;
			return zip.file(filename).async("string");
	    }).then(function (text) {
	      console.log('csv', text);
	      csv({noheader:false})
			.fromString(text)
			.on('json', (json) => {  //each row in csv as a json
				var currency = json.currency;
				if (currency){
					json.display_price = json.display_price.replace(currency, getSymbolFromCurrency(currency));
				}
				
			    db.logAffiliate(json);
			})
			.on('done', () => {
				console.log('completed');
			})

	    });
	  });
	});

	req.on("error", function(err){
	  // handle error
	  console.log(err);
	});
}


module.exports = {
  fetch: fetchAffiliate,
}
