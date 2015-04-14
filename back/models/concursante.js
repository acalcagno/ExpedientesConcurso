var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var concursanteSchema = new Schema({
  documento:    { type: String },
  apellido:     { type: String }
});

module.exports = mongoose.model('Concursante', concursanteSchema);

/*,
  nombre:  { type: String },
  perfil:    { type: String, enum:
  ['Drama', 'Fantasy', 'Sci-Fi', 'Thriller', 'Comedy']
        },
  titulo:  { type: Number }    */