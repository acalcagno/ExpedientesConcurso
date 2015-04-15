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
		col_perfiles.find({}).toArray(function(err, perfiles){
			response.send(JSON.stringify(perfiles));
		});	
	});
	
	app.post('/guardarFojasParaUnPostulanteAUnPerfil', function(request, response){
		var nombre_perfil = request.body.perfil;
		var dni_postulante = request.body.dniPostulante;
		var documentacion_requerida = request.body.documentos;
		var col_perfiles = db.collection('perfiles');
		col_perfiles.find({
			nombre:nombre_perfil				
		}).toArray(function(err, perfiles){
			if(err) throw err;
			var perfil = perfiles[0];
			var postulante_a_perfil;
			perfil.postulantes.forEach(function(p){
				if(p.dni == dni_postulante) postulante_a_perfil = p;
			});
			postulante_a_perfil.documentosPresentados = [];
			
			documentacion_requerida.forEach(function(docu){
				postulante_a_perfil.documentosPresentados.push({
					documento: docu.nombre,
					cantidadFojas: docu.fojas
				});
			});
			col_perfiles.save(perfil, function(err){
				if(err) throw err;
				response.send("ok");	
			});
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
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var server = http.createServer(app);
server.listen(3000, function() {
    console.log("Servidor levantado en el puerto 3000");
});  