
var express = require('express');
var http = require('http');
var mongodb = require('mongodb');
var _ = require("./underscore-min");
var serveStatic = require('serve-static')

var ObjectId = mongodb.ObjectID;

var uri_mongo = 'mongodb://127.0.0.1/ExpedientesConcurso';
var app = express();

app.use(serveStatic('../front', {'index': ['RecepcionYFoliado.html']}))

process.on('uncaughtException', function (err) {
  	console.log('Tiró error: ', err.toString());
});

mongodb.MongoClient.connect(uri_mongo, function(err, db) {  
  	if(err) throw err;
	
	app.get('/getPostulantePorDni/:dni', function(request, response){
		var dni = request.params.dni.toString();
		
		db.collection('postulantes').findOne({"dni": dni}, function(err, postulante){		
			if(postulante == null) {
				response.send(JSON.stringify({encontrado:false}));
				return;
			}			
			response.send(JSON.stringify(postulante));
		});	
	});	
	
	
	app.get('/getPerfilPorCodigo/:codigo', function(request, response){
		var codigo = request.params.codigo;
		
		db.collection('perfiles').findOne({"codigo": codigo}, function(err, perfil){		
			if(perfil == null) {
				response.send(JSON.stringify({encontrado:false}));
				return;
			}			
			response.send(JSON.stringify(perfil));
		});	
	});	
	
	app.get('/getChecklistPorCodigo/:codigo', function(request, response){
		var codigo = request.params.codigo;
		
		db.collection('checklists').findOne({"codigo": codigo}, function(err, checklist){		
			if(checklist == null) {
				response.send(JSON.stringify({encontrado:false}));
				return;
			}			
			response.send(JSON.stringify(checklist));
		});	
	});		
	
	app.get('/getDocumentoPorCodigo/:codigo', function(request, response){
		var codigo = request.params.codigo;
		
		db.collection('documentos').findOne({"codigo": codigo}, function(err, documento){		
			if(documento == null) {
				response.send(JSON.stringify({encontrado:false}));
				return;
			}			
			response.send(JSON.stringify(documento));
		});	
	});	
	
	app.post('/guardarPostulante', function(request, response){
		var postulante = request.body.postulante;
		delete postulante._id;
		db.collection('postulantes').update({dni:postulante.dni}, postulante, function(err){
			if(err) throw err;
			response.send("ok");	
		});
	});	
	
	app.post('/crearExpediente', function(request, response){
		var numero_expediente = request.body.numero;
		
		db.collection('expedientes').save({numero: numero_expediente}, function(){
			if(err) throw err;
			response.send("ok");
		});
	});
	
	app.get('/todosLosExpedientes', function(request, response){
		var col_expedientes = db.collection('expedientes');
		col_expedientes.find({}).toArray(function(err, expedientes){
			response.send(JSON.stringify(expedientes));
		});	
	});
	
	app.get('/getExpedientePorId/:id', function(request, response){
		var id = request.params.id;
		var ObjectId = require('mongodb').ObjectID;
		db.collection('expedientes').findOne({"_id": new ObjectId(id)}, function(err, expediente){		
			if(expediente == null) {
				response.send(JSON.stringify({encontrado:false}));
				return;
			}			
			response.send(JSON.stringify(expediente));
		});	
	});
	
	app.get('/postulacionesDelExpediente/:numero', function(request, response){
		var postulaciones_respuesta = [];			
		var documentacion_presentada = [];
		var postul_ant = "";
		db.collection('postulantes').find({}).toArray(function(err, postulantes){		
			db.collection('perfiles').find({}).toArray(function(err, perfiles){
				db.collection('documentos').find({}).toArray(function(err, documentos){
				_.forEach(postulantes, function(postulante){
					_.forEach(_.where(postulante.postulaciones, {incluidoEnExpediente:request.params.numero}), function(postulacion){
						var perfil = _.findWhere(perfiles, {codigo: postulacion.codigoPerfil});
						if(postul_ant != postulante.ObjectId) {
							postul_ant = postulante.ObjectId;
							_.forEach(postulacion.documentacionPresentada, function(doc_presentada){
								var documento = _.findWhere(documentos, {codigo: doc_presentada.codigo});						
								documentacion_presentada.push({
									descripcion: documento.descripcion,
									cantidadFojas: doc_presentada.cantidadFojas
								})
							});
						}
						postulaciones_respuesta.push({
							postulante: {
								nombre: postulante.nombre,
								apellido: postulante.apellido,
								dni: postulante.dni
							},						
							perfil: {
								codigo: perfil.codigo,
								descripcion: perfil.descripcion
							},
							documentacionPresentada: {
								documentos: documentacion_presentada
							}
						});
					});
				});	
				response.send(JSON.stringify(postulaciones_respuesta));
				});
			});
		});
	});
	
	app.post('/quitarPostulacionDeExpediente', function(request, response){
		var postulacion = request.body.postulacion;
		
		var col_postulantes = db.collection('postulantes');
		col_postulantes.findOne({dni: postulacion.dniPostulante}, function(err, postulante){
			_.findWhere(postulante.postulaciones, {codigoPerfil: postulacion.codigoPerfil }).incluidoEnExpediente = "";
			col_postulantes.save(postulante, function(err){
				if(err) throw err;
				response.send("ok");	
			});
		});	
	});
	
	app.get('/todosLosPerfiles', function(request, response){
		var col_perfiles = db.collection('perfiles');
		col_perfiles.find({}).toArray(function(err, perfiles){
			response.send(JSON.stringify(perfiles));
		});	
	});
	
	app.get('/postulacionesDelPerfil/:codigo', function(request, response){		
		var postulaciones_respuesta = [];			
		db.collection('postulantes').find({}).toArray(function(err, postulantes){		
			db.collection('perfiles').find({}).toArray(function(err, perfiles){
				db.collection('checklists').find({}).toArray(function(err, checklists){
					_.forEach(postulantes, function(postulante){
						_.forEach(_.where(postulante.postulaciones, {codigoPerfil:request.params.codigo}), function(postulacion){
							var perfil = _.findWhere(perfiles, {codigo: postulacion.codigoPerfil});
							var checklist = _.findWhere(checklists, {codigo: postulacion.codigoChecklist});
							
							var presento_toda_la_documentacion = true;
							_.forEach(checklist.documentacionRequerida, function(doc_requerido){
								var doc_presentado = _.findWhere(postulacion.documentacionPresentada, {codigo: doc_requerido.codigo});
								if(doc_presentado!==undefined) 
									{if(doc_presentado.cantidadFojas == "") presento_toda_la_documentacion = false;
									}
								else 
									{presento_toda_la_documentacion = false;}
							});
							
							postulaciones_respuesta.push({
								postulante: {
									nombre: postulante.nombre,
									apellido: postulante.apellido,
									dni: postulante.dni
								},						
								perfil: {
									codigo: perfil.codigo,
									descripcion: perfil.descripcion
								},
								incluidoEnExpediente: postulacion.incluidoEnExpediente,
								presentoTodaLaDocumentacion: presento_toda_la_documentacion
							});
						});
					});
					response.send(JSON.stringify(postulaciones_respuesta));
				});
			});				
		});	
	});
	
		
	app.post('/incluirPostulacionEnExpediente', function(request, response){
		var dni_postulante = request.body.dniPostulante;
		var codigo_perfil = request.body.codigoPerfil;
		var numero_expediente= request.body.numeroExpediente;
				
		var col_postulantes = db.collection('postulantes');
		col_postulantes.findOne({dni: dni_postulante}, function(err, postulante){
			_.findWhere(postulante.postulaciones, {codigoPerfil:codigo_perfil}).incluidoEnExpediente = numero_expediente;
			col_postulantes.save(postulante, function(err){
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