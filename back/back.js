var express = require('express');
var http = require('http');
var express = require('express');
var mongodb = require('mongodb');
var _ = require("./underscore-min");

var ObjectId = mongodb.ObjectID;

var uri = 'mongodb://127.0.0.1/ExpedientesConcurso';
var app = express();

mongodb.MongoClient.connect(uri, function(err, db) {  
  	if(err) throw err;
	
	app.get('/todosLosPerfiles', function(request, response){
		var col_perfiles = db.collection('perfiles');
		col_perfiles.find({}).toArray(function(err, perfiles){
			response.send(JSON.stringify(perfiles));
		});	
	});
	
	app.get('/todosLosExpedientes', function(request, response){
		var col_expedientes = db.collection('expedientes');
		col_expedientes.find({}).toArray(function(err, expedientes){
			response.send(JSON.stringify(expedientes));
		});	
	});
	
	app.get('/postulantesDelExpediente/:id', function(request, response){
		var col_perfiles = db.collection('perfiles');
		col_perfiles.find({}).toArray(function(err, perfiles){
			var postulantes = [];
			_.forEach(perfiles, function(perfil){
				_.forEach(_.where(perfil.postulantes, {incluidoEnExpediente:request.params.id}), function(postulante){
					postulantes.push({
						nombre: postulante.nombre,
						apellido: postulante.apellido,
						dni: postulante.dni,
						perfil: {
							id: perfil._id,
							nombre: perfil.nombre
						}
					});
				});
			});
			response.send(JSON.stringify(postulantes));
		});	
	});
	
	app.post('/quitarPostulanteAPerfilDeExpediente', function(request, response){
		var postulante = request.body.postulante;
		
		var col_perfiles = db.collection('perfiles');
		col_perfiles.find({_id: new ObjectId(postulante.idPerfil)}).toArray(function(err, perfiles){
			var perfil = perfiles[0];
			_.findWhere(perfil.postulantes, {dni:postulante.dni}).incluidoEnExpediente = "";
			col_perfiles.save(perfil, function(err){
				if(err) throw err;
				response.send("ok");	
			});
		});	
	});
	
	app.post('/incluirPostulanteAPerfilEnExpediente', function(request, response){
		var dni_postulante = request.body.dniPostulante;
		var id_perfil = request.body.idPerfil;
		var id_expediente= request.body.idExpediente;
		
		var col_perfiles = db.collection('perfiles');
		col_perfiles.find({_id: new ObjectId(id_perfil)}).toArray(function(err, perfiles){
			var perfil = perfiles[0];
			_.findWhere(perfil.postulantes, {dni:dni_postulante}).incluidoEnExpediente = id_expediente;
			col_perfiles.save(perfil, function(err){
				if(err) throw err;
				response.send("ok");	
			});
		});	
	});

	app.post('/crearExpediente', function(request, response){
		var numero_expediente = request.body.numero;
		
		var col_expedientes = db.collection('expedientes');
		col_expedientes.save({numero: numero_expediente}, function(){
			if(err) throw err;
			response.send("ok");
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