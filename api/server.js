/** importar o módulo do framework express*/
const express = require('express');

/**Importa o mongodb */
const mongodb = require('mongodb');
const objectId = require('mongodb').ObjectId;

/**importar o módulo do body-parser*/
const bodyParser = require('body-parser');

const multParty = require('connect-multiparty');

const fs = require('fs');

/**importar o módulo do express-validator*/
//const expressValidator = require('express-validator');

/**iniciando o objeto do express*/
const server = express();


/**configurar o middleware do body-parser */
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(multParty());

server.use(function(req,res,next){

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

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

    var pathOrigem = req.files.arquivo.path;
    var urlImagem = new Date().getTime()+'_'+req.files.arquivo.originalFilename;
    var pathDestino = './uploads/' + urlImagem;
    
    fs.rename(pathOrigem, pathDestino, function (err) {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }

        var dados = {
            url_imagem: urlImagem,
            titulo: req.body.titulo
        }

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
            collection.update(
                { _id : objectId(req.params.id) },
                { $push : {
                    comentarios : {
                        id_comentario : new objectId(),
                        comentario : req.body.comentario
                        }
                    }
                },
                {},
                function(err, records){
                    if(err){
                        res.json(err);
                    }else{
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
            collection.update(
                { },
                { $pull : {
                    comentarios : {
                        id_comentario : objectId(req.params.id)
                        }
                    }
                },
                { multi : true },
                function(err, records){
                    if(err){
                        res.json(err);
                    }else{
                        res.json(records);
                    }
                    mongoclient.close();
                }  
            );
        });
    });
});


server.get('/imagens/:imagem', function (req, res) {
    var img = req.params.imagem;
    fs.readFile('./uploads/'+img,function(err,content){
        if(err){
            res.status(404).json(err);
            return;
        }
        res.writeHead(200,{'content-type':'imagen/jpg'})
        res.end(content);
    });
});