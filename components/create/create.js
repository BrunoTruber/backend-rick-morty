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

// [POST] postPersonagem - criar personagenm
router.post("/", async (req, res) => {
	const objeto = req.body;

	if (!objeto || !objeto.nome || !objeto.imagemUrl) {
		res.status(400).send(
			{error: "Requisição inválida, certifique-se que tenha os campos nome e imagemUrl"}
		);
		return;
	}

	const result = await personagens.insertOne(objeto);

	console.log(result)
	//se ocorrer algum erro com o mongo esse if vai detectar
	if (result.acknowledged == false) {
		res.status(500).send({error: "Ocorreu um erro"});
		return;
	}

	res.status(201).send(objeto);
  });
  
})();

module.exports = router;