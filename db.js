var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url =  'mongodb://localhost:27017/ensemblrTest';
const productionsCollection = 'productions';
const theatreCollection = 'theatres';


// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
  var theatre = { 
  	name: 'Adelphi Theatre 13',
    address: 'I am not sure13',
    website: 'www.adelphitheatre.co...uk' 
  };

  upsertDocument(theatre, theatreCollection, db, function(){
  	findAllDocuments(theatreCollection, db, function(){
  		db.close();
  	})
  })
});

var upsertDocument = function (object, collection, db, callback) {
	var collection = db.collection(collection);
	collection.updateOne({ name : object.name }, { $set: object }, { upsert: true },
		function(err, result) {

			if (result.result.nModified == 1){
				console.log("Updated the document to: ", object);
			}
			if (result.result.upserted) {
				console.log("Inserted document: ", object);
			}

			callback(result);
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