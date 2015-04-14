var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/concursantes', function(err, res) {
    if(err) {
        console.log('ERROR: conectando la db. ' + err);
    } else {
        console.log('Conectado a la db');
    }
});

var fs = require('fs');
var lineList = fs.readFileSync('concursantes_ejemplo.csv').toString().split('\n');
lineList.shift(); // Shift the headings off the list of records.

var schemaKeyList = ['dni', 'apellido', 'nombre', 'perfil' ,'ponderacion'];

var Concursantes = new mongoose.Schema({
    perfiles: [{
        nombre: String,
        documentacionRequerida:[String],
        postulantes:[{
            apellido: String,
            nombre: Sting,
            ponderacion: Number,
            documento: Number,
            documentosPresentados: [{
                documento:String,
                cantidadFojas:Number}],
        }]
    }]
});

var Concursantes = mongoose.model('Concursantes', Concursantes);

function queryAllEntries () {
    Concursantes.aggregate(
        {$group: {_id: '$RepName', oppArray: {$push: {
            OppID: '$OppID', 
            OppName: '$OppName',
            PriorAmount: '$PriorAmount',
            Amount: '$Amount'
            }}
        }}, function(err, qDocList) {
        console.log(util.inspect(qDocList, false, 10));
        process.exit(0);
    });
}

// Recursively go through list adding documents.
// (This will overload the stack when lots of entries
// are inserted.  In practice I make heavy use the NodeJS 
// "async" module to avoid such situations.)
function createDocRecurse (err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    if (lineList.length) {
        var line = lineList.shift();
        var doc = new RepOppDoc();
        line.split(',').forEach(function (entry, i) {
            doc[schemaKeyList[i]] = entry;
        });
        doc.save(createDocRecurse);
    } else {
        // After the last entry query to show the result.
        queryAllEntries();
    }
}

createDocRecurse(null);