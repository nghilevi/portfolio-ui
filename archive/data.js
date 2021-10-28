var MongoClient = require('mongodb').MongoClient,
	fs = require('fs');

MongoClient.connect('mongodb://localhost:27017/localhostDB',function(err,db){
	if(err) throw err;

	// OUTPUT FROM DB: Generate -> newData.json
	db.collection('nghiportfolio').find({}).sort({'rankId':1,'cat':-1,'rating':-1}).toArray(function(err,result){
		if(err) throw err; 
		result =JSON.stringify(result,null, "\t");
		
		fs.writeFile("./data.json", result,'utf-8', function(err) {
		    if(err) throw err;
		    console.log("The file was saved!");
		});

		db.close();
	});

	// UPDATE DB: update each doc in nghiportfolio collection based from newData.json
	// var newData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
	// var newDataLength=newData.length;
	// console.log(newData);
	// console.log(newDataLength);
	// for(var i=0;i<newDataLength;i++){
	// 	db.collection('nghiportfolio').update({'_id':newData[i]._id},newData[i],function(err,i){
	// 		if(err) throw err;
	// 		if(i==newDataLength-1){
	// 			db.close();
	// 			console.log("Successfully update!");
	// 		}
	// 	});
	// }
	
});

//Some alternative manual ways:
//To import: mongoimport -d localhostDB -c nghiportfolio --file data.json --jsonArray
//To export: http://docs.mongodb.org/manual/reference/program/mongoexport/#bin.mongoexport
//To beautify json: http://codebeautify.org/jsonviewer -> recheck: codebeautify.org/jsonviewer


