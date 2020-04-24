/*jshint esversion: 6 */

// Requires 

var express = require('express');
var mongoose = require('mongoose');

// Inicializar variable 

var app = express();

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');


// Conexión a la base de datos

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, resp) => {

    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');


});


// Rutas 
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);

//escuchar petición
app.listen(3000, () => {
    console.log('express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});