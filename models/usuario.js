var moongose = require('mongoose');

var Schema = moongose.Schema;

var usuarioShema = new Schema({


    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'la contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE' },


});


module.exports = moongose.model('Usuario', usuarioShema);