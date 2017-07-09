var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url = process.env.MONGODB_URI || 'mongodb://localhost:27017/ensemblr';
const productionsCollection = 'productions';
const theatreCollection = 'theatres';

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

var process = function(show){
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  console.log("Connected correctly to server");

	  var theatre = show.theatre;

	  upsertDocument(theatre, theatreCollection, db, function(id){
	  	if (id){
	  		show.theatre = id;
		  	upsertDocument(show, productionsCollection, db, function(){
			  	console.log('Mongo Closed.');
		  	});
	  	}
	  })
	});
}

var upsertDocument = function (object, collectionName, db, callback) {
	var collection = db.collection(collectionName);
	collection.updateOne({ name : object.name }, { $set: object }, { upsert: true },
		function(err, result) {
			if (err){
				console.log(err);
				return;
			}

			if (result.modifiedCount > 0){
				console.log("Updated document to: ", object);
			}
			if (result.upsertedCount > 0) {
				console.log("Inserted document: ", object, " with Id ", result.upsertedId._id);
				callback(result.upsertedId._id);
			}

			console.log('Nothing to Upsert for', collectionName);

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


var findAllDocuments = function(theatreCollection, db, callback) {
  var collection = db.collection(theatreCollection);
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
  	console.log("============Found the following records=============");
    console.dir(docs);
    callback(docs);
  });
}

// process(show);

module.exports = {
	process: process,
};