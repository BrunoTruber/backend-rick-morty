const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
(async () => {
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;
  const dbChar = process.env.DB_CHAR;
  const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.${dbChar}.mongodb.net/${dbName}?retryWrites=true&w=majority`;
  const options = {
    useUnifiedTopology: true,
  };
  const client = await mongodb.MongoClient.connect(connectionString, options);

  const db = client.db("blue_db");
  const personagens = db.collection("personagens");

  const getPersonagemById = async (id) =>
    personagens.findOne({ _id: ObjectId(id) });

  //Middleware - especifica que é esse o import do router no index que queremos utilizar
  router.use(function timelog(req, res, next) {
    next();
    console.log("Time: ", Date.now());
  });

//[DELETE] deleta um personagem
router.delete("/:id", async (req, res) => {
	const id = req.params.id;
	//retorna a quantidade de personagens com o filtro(Id) especificado
	const quantidadePersonagens = await personagens.countDocuments({
		_id: ObjectId(id),
	});

	//checa se existe o personagem solicitado
	if(quantidadePersonagens !==1){
		res.status(404).send({error: 'personagem nao encontrado'})
		return;
	}
	//dleta personagem
	const result = await personagens.deleteOne({
		_id: ObjectId(id),
	});
	//se nao conseguue deletar, erro do mongodb
	if(result.deletedCount !== 1) {
			res.status(500).send({error:"Ocorreu um erro ao remover o personagem"});
		return;
	}

	res.send(204);

    });
    
})();
  
module.exports = router;