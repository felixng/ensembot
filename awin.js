var request = require('request');
var http = require("http");
var url = require("url");
var JSZip = require("jszip");
const csv = require('csvtojson');

function unzip(){
	var req = http.get(url.parse("http://datafeed.api.productserve.com/datafeed/download/apikey/fb254e63aaef52ca79339f4cf2c571ee/language/en/fid/1936/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id/format/csv/delimiter/%2C/compression/zip/adultcontent/1/"), function (res) {
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
				console.log('==== json object ====');
			    console.log(json);
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
  unzip: unzip,
}
