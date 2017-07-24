var MongoClient = require('mongodb').MongoClient;

var url = process.env.MONGODB_URI || 'mongodb://localhost:27017/ensemblr';
const productionsCollection = 'productions';
const theatreCollection = 'theatres';
const affiliatesCollection = 'affiliates';
const linksCollection = 'links';
var Fuse = require("fuse.js");

// var show = { name: 'Kinky Boots',
//   theatre: 
//    { name: 'Adelphi Theatre',
//      address: 'Adelphi Theatre, Strand, London, WC2E 7NA',
//      website: 'www.adelphitheatre.co.uk' },
//   genre: 'Musical1',
//   showTime: 'Mon-Sat 7.30pm, Wed & Sat 2.30pm',
//   duration: '2h30',
//   previewFrom: '21.08.2015',
//   openingNight: '15.09.2015',
//   showingUntil: '24.03.2018',
//   confirmedClosing: false,
//   twitter: 'https://twitter.com/KinkyBootsUK',
//   facebook: 'https://www.facebook.com/KinkyBootsUK' };

var logAffiliate = function(affiliate) {
	MongoClient.connect(url, function(err, db) {
		if (err){
			console.log(err);
			return;
		}

		if (db) {
			// matchAffiliateToProduction(affiliate, db, function(){
				insertAffiliate(affiliatesCollection, affiliate, db, function(){
					console.log('Affiliate logged');
				})
			// })
		}
	}); 
}

var matchAffiliateToProduction = function(affiliate, db, callback){
	var collection = db.collection(productionsCollection);
	collection.find({}).toArray(function(err, productions){
		if (err){
			console.log(err);
			return;
		}

		var options = {
		  // keys: ['name', 'author'],
		  keys: ['name'],
		  id: 'name'
		}

		var fuse = new Fuse(productions, options);
		console.log('search keyword ', affiliate.product_name);
		console.log('search result ', fuse.search(affiliate.product_name));
		affiliate.production = fuse.search(affiliate.product_name);

		// callback(result);
	});
}

var logLinks = function(links) {
	MongoClient.connect(url, function(err, db) {
	  insertLinks(links, db, function(){
	  	console.log('Links logged');
	  })
	}); 
}

var execute = function(show){
	MongoClient.connect(url, function(err, db) {
	  console.log("Connected correctly to server");

	  var theatre = show.theatre;

	  upsertDocument(theatre, theatreCollection, db, function(id){
	  	if (id){
	  		show.theatre = id;
	  		checkExistingProduction(show, db, function(updatedShow){
	  			upsertDocument(updatedShow, productionsCollection, db, function(){
				  	console.log('Upsert completed for ', show.name);
			  	});
	  		})
	  	}
	  })
	});
}

var insertAffiliate = function(collectionName, doc, db, callback) {
  var collection = db.collection(collectionName);

  collection.updateOne({ aw_product_id : doc.aw_product_id }, 
						 { $set: doc }, 
						 { upsert: true },
		function(err, result) {
			if (err){
				console.log(err);
				return;
			}

			callback();
		});  
}

var insertLinks = function(links, db, callback) {
  var collection = db.collection(linksCollection);
  links.lastModified = Math.floor(Date.now()).toString();

  collection.insertOne(links, function(err, result) {
    callback(result);
  });
}

var checkExistingProduction = function (object, db, callback) {
	var collection = db.collection(productionsCollection);
	
	object.lastModified = Math.floor(Date.now()).toString();

	collection.findOne({ name : object.name }, function(err, result){
		if (err){
			console.log(err);
			return;
		}

		console.log('Found ', result);
		if (result && result.overrideTwitter) {
			object.overrideTwitter = true
		}
		else{
			object.overrideTwitter = false;	
		}

		if (object.overrideTwitter) {
			console.log('Override twitter for ', object.name);
			delete object.twitter;
		}

		callback(object);
	});
}

var upsertDocument = function (object, collectionName, db, callback) {
	var collection = db.collection(collectionName);
	var setOnInsert = { createdAt: Math.floor(Date.now()).toString(), };
	object.lastModified = Math.floor(Date.now()).toString();

	collection.updateOne({ name : object.name }, 
						 { $set: object, $setOnInsert: setOnInsert }, 
						 { upsert: true },
		function(err, result) {
			if (err){
				console.log(err);
				return;
			}

			if (result.modifiedCount > 0){
				console.log("Updated document to: ", object);
			}
			else if (result.upsertedCount > 0) {
				console.log("Inserted document: ", object, " with Id ", result.upsertedId._id);
				callback(result.upsertedId._id);
			}
			else {
				console.log('Nothing to Upsert for', object.name);	
			}

			collection.find({ name : object.name }).toArray(function(err, docs) {
				if (err){
					console.log(err);
				}
				else{
					callback(docs[0]._id);	
				}
			})
	});  
}


var findAllDocuments = function(collectionName, db, callback) {
  var collection = db.collection(collectionName);
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
  	console.log("============Found the following records=============");
    console.dir(docs);
    callback(docs);
  });
}

function sanitizeStr(s) {
    return '#' + s;
}

function iterAll(object) {
    Object.keys(object).forEach(function (k) {
        if (object[k] && typeof object[k] === 'object') {
            iterAll(object[k]);
            return;
        }
        object[k] = sanitizeStr(object[k]);
    })
}

module.exports = {
	process: execute,
	logLinks: logLinks,
	logAffiliate: logAffiliate,
};