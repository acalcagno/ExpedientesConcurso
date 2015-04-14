var express = require('express'),
    app = express(),
    http = require('http'),
    mongoose = require('mongoose'),
    server = http.createServer(app);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
};

app.configure(function() { 
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(allowCrossDomain);
});

app.get('/', function(req, res) {
    res.send("hello world");
});

routes = require('./routes/concursantes')(app);


mongoose.connect('mongodb://localhost/concursantes', function(err, res) {
    if(err) {
        console.log('ERROR: conectando la db. ' + err);
    } else {
        console.log('Conectado a la db');
    }
});



server.listen(3000, function() {
    console.log("Servidor levantado en el puerto 3000");
});