/*jslint  esversion: 6 */

var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');

//===============================================================================
// creando el login 
//===============================================================================

app.post('/', (requets, response) => {

    var body = requets.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err,
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err,
            });
        }

        // Crear un token !!
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, '@este-es@-un-seed-dificil', { expiresIn: 14400 }); // 4 horas

        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id,
        });

    });

});

module.exports = app;