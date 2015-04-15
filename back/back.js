var express = require('express');
var http = require('http');
var express = require('express');
var mongodb = require('mongodb');

var uri = 'mongodb://localhost/ExpedientesConcurso';
var app = express();

mongodb.MongoClient.connect(uri, function(err, db) {  
  	if(err) throw err;
	
	app.get('/todosLosPerfiles', function(request, response){
		var col_perfiles = db.collection('perfiles');
		col_perfiles .find({}).toArray(function(err, perfiles){
			response.send(JSON.stringify(perfiles));
		});	
	});
});
var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    }
app.use(allowCrossDomain);
var server = http.createServer(app);
server.listen(3000, function() {
    console.log("Servidor levantado en el puerto 3000");
});  