/*jslint  esversion: 8 */

var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// Google 
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var mdautenticacion = require('../middlewares/autentificacion');

//===============================================================================
// comentario
//===============================================================================



app.get('/renuevatoken', mdautenticacion.verificaToken, (request, response) => {

    var token = jwt.sign({ usuario: request.usuario }, SEED, { expiresIn: 14400 }); // 4 horas

    response.status(200).json({
        ok: true,
        // usuario: request.usuario,
        token: token
    });

});

//===============================================================================
// Autentificación de Google
//===============================================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload.sub;
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async(request, response) => {

    var token = request.body.token;

    var googleUser = await verify(token)
        .catch(err => {
            return response.status(403).json({
                ok: false,
                mensaje: 'token no valido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {

            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });

        }
        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autentificación normal',
                });

            } else {
                // usuarioDB.password = ':)';
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                response.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role),
                });

            }

        } else {
            // El usuario no existe .. hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';


            usuario.save((err, usuarioDB) => {

                // usuarioDB.password = ':)';
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                response.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role),
                });

            });

        }


    });

    // return response.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!!',
    //     googleUser: googleUser,
    // });
});




//===============================================================================
// creando el login Autentificación Normal
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
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role),

        });

    });

});



function obtenerMenu(ROLE) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'Progressbar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Rxjs', url: '/rxjs' }


            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Médicos', url: '/medicos' },
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {

        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' }, );

    }


    return menu;

}


module.exports = app;