var express = require('express');
var http = require('http');
var mongodb = require('mongodb');
var _ = require("./underscore-min");

var ObjectId = mongodb.ObjectID;

var uri_mongo = 'mongodb://127.0.0.1/ExpedientesConcurso';
var app = express();

process.on('uncaughtException', function (err) {
  	console.log('Tiró error: ', err.toString());
});

mongodb.MongoClient.connect(uri_mongo, function(err, db) {  
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
	
	app.get('/getPostulantePorDni/:dni', function(request, response){
		var dni = request.params.dni.toString();
		
		db.collection('checklists').find({"postulantes.dni": dni}).toArray(function(err, checklists){			
			var postulante = {encontrado: (checklists.length>0)};
			var p = _.findWhere(checklists[0].postulantes, {dni: dni});
			postulante.dni = p.dni;
			postulante.nombre = p.nombre;
			postulante.apellido = p.apellido;
			postulante.perfiles = _.map(checklists, function(chk){
				return {
					nombre: chk.nombrePerfil,
					idChecklist: chk._id
				}
			});		
			
			response.send(JSON.stringify(postulante));
		});	
	});
	
	app.post('/getDocumentacionChecklistPostulante', function(request, response){
		var dni = request.body.dni.toString();
		var idChecklist = request.body.idChecklist;
		
		db.collection('checklists').findOne({_id: new ObjectId(idChecklist)}, function(err, checklist){			
			documentacion = _.map(checklist.documentacionRequerida, function(doc_req){
				var p = _.findWhere(checklist.postulantes, {dni: dni});
				var doc_pres = _.findWhere(p.documentacionPresentada , {descripcion: doc_req});
				if(!doc_pres) doc_pres = {cantidadFojas : ""};
				return {
					descripcion: doc_req, 
					cantidadFojas: doc_pres.cantidadFojas,
					presentado: doc_pres.cantidadFojas != ""
				};
			});

			response.send(JSON.stringify(documentacion));
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
		
		db.collection('expedientes').save({numero: numero_expediente}, function(){
			if(err) throw err;
			response.send("ok");
		});
	});
	
	app.post('/guardarFojasParaUnPostulanteAUnPerfil', function(request, response){
		var id_checklist = request.body.idChecklist;
		var dni_postulante = request.body.dniPostulante;
		var documentacion_requerida = request.body.documentacion;
		
		db.collection('checklists').findOne({_id: new ObjectId(id_checklist)}, function(err, checklist){		
			var postulante_a_perfil = _.findWhere(checklist.postulantes, {dni: dni_postulante});
			postulante_a_perfil.documentacionPresentada = _.map(documentacion_requerida, function(docu){
				return {
					descripcion: docu.descripcion,
					cantidadFojas: docu.cantidadFojas
				};
			});
			
			db.collection('checklists').save(checklist, function(err){
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