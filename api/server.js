/** importar o módulo do framework express*/
const express = require('express');

/**Importa o mongodb */
const mongodb = require('mongodb');
const objectId = require('mongodb').ObjectId;

/**importar o módulo do body-parser*/
const bodyParser = require('body-parser');

/**importar o módulo do express-validator*/
//const expressValidator = require('express-validator');

/**iniciando o objeto do express*/
const server = express();


/**configurar o middleware do body-parser */
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
/**exportar o objeto server */

const hostname = '127.0.0.1';
//Porta do servidor ficara escutando
const port = 3000;

/** Configuração do banco */
var db = new mongodb.Db(
    'instagram',
    new mongodb.Server('localhost', 27017, {}),
    {}
);


/**Serviços */
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


server.get('/', function (req, res) {
    res.send({ msg: 'Hello World API' });
});

server.post('/api', function (req, res) {
    var dados = req.body;
    console.log("Dados Req:", dados);

    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.insert(dados, function (err, records) {
                if (err) {
                    res.json({ 'status': 'erro' });
                } else {
                    res.json({ 'status': 'inclusao realizada com sucesso' });
                }
                mongoclient.close();
            });
        });
    });
});


server.get('/api', function (req, res) {

    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.find().toArray(function (err, results) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(results);
                }
                mongoclient.close();
            });
        });
    });
});

server.get('/api/:id', function (req, res) {
    console.log();
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.find(objectId(req.params.id)).toArray(function (err, results) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(results);
                }
                mongoclient.close();
            });
        });
    });
});


server.put('/api/:id', function (req, res) {
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.update({ _id: objectId(req.params.id) },
                { $set: { titulo: req.body.titulo } },
                {},
                function (err, records) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    mongoclient.close();
                }
            );
        });
    });
});



server.delete('/api/:id', function (req, res) {
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.remove({ _id: objectId(req.params.id) },  function (err, records) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(records);
                }
                mongoclient.close();
            });
        });
    });
});

