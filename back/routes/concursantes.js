module.exports = function(app) {
    var Concursante = require('../models/concursante.js');
    
    findAllConcursantes = function (req, res) {
        res.header('Access-Control-Allow-Origin', "*")
        console.log("se recibio el request " + req.toString());
        
        
        Concursante.find(function(err, concursantes) {
            if(!err) {
                res.send(concursantes);
                console.log("se entregaro el response " + res.toString());
            } else {
                console.log('ERROR: ' + err);
                console.log("hubo un error " + err.toString());
            }
        });
    }

    //GET - Return a TVShow with specified ID
    findById = function(req, res) {
        Concursante.findById(req.params.id, function(err, tvshow) {
            if(!err) {
            console.log('GET /concursante/' + req.params.id);
                res.send(tvshow);
            } else {
                console.log('ERROR: ' + err);
            }
        });
    };
    
    //POST - Insert a new TVShow in the DB
    addConcursante = function(req, res) {
        console.log('POST');
        console.log(req.body);

        var concursante = new Concursante({
            documento:    req.body.documento,
            apellido: 	  req.body.apellido
        });

        concursante.save(function(err) {
            if(!err) {
                console.log('Created');
            } else {
                console.log('ERROR: ' + err);
            }
        });
        res.send(JSON.stringify(concursante));
    };

/*
  //PUT - Update a register already exists
  updateTVShow = function(req, res) {
  	TVShow.findById(req.params.id, function(err, tvshow) {
  		tvshow.title   = req.body.petId;
  		tvshow.year    = req.body.year;
  		tvshow.country = req.body.country;
  		tvshow.poster  = req.body.poster;
  		tvshow.seasons = req.body.seasons;
  		tvshow.genre   = req.body.genre;
  		tvshow.summary = req.body.summary;

  		tvshow.save(function(err) {
  			if(!err) {
  				console.log('Updated');
  			} else {
  				console.log('ERROR: ' + err);
  			}
  			res.send(tvshow);
  		});
  	});
  }

  //DELETE - Delete a TVShow with specified ID
  deleteTVShow = function(req, res) {
  	TVShow.findById(req.params.id, function(err, tvshow) {
  		tvshow.remove(function(err) {
  			if(!err) {
  				console.log('Removed');
  			} else {
  				console.log('ERROR: ' + err);
  			}
  		})
  	});
  }
*/
  //Link routes and functions
  app.get('/concursantes', findAllConcursantes);
  app.get('/concursante/:id', findById);
  app.post('/concursante', addConcursante);
  //app.put('/tvshow/:id', updateTVShow);
  //app.delete('/tvshow/:id', deleteTVShow);*/
    
    
app.get('/documentacion', function (req, res) {
        res.header('Access-Control-Allow-Origin', "*");
        res.send(JSON.stringify(["Titulo", "Antecedentes Penales", "Administracion Publica", "Cursos"]));
    });
    
}