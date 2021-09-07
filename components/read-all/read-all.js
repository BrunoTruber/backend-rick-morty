const express = require('express');
const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;
require('dotenv').config();
require('express-async-errors');
var cors = require('cors');

(async () => {
	const dbUser = process.env.DB_USER;
	const dbPassword = process.env.DB_PASSWORD;
	const dbName = process.env.DB_NAME;
	const dbChar = process.env.DB_CHAR;

	const app = express();
	app.use(express.json());

	const port = process.env.PORT || 3000;
	const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.${dbChar}.mongodb.net/${dbName}?retryWrites=true&w=majority`;

	const options = {
		useUnifiedTopology: true,
	};

	const client = await mongodb.MongoClient.connect(connectionString, options);

	console.info('Conexão estabelecida com o MongoDB Atlas')

	const db = client.db("blue_db");
	const personagens = db.collection("personagens");

	const getPersonagensValidos = () => personagens.find({}).toArray();

	const getPersonagemById = async (id) =>
		personagens.findOne({ _id: ObjectId(id) });

  //Middleware - especifica que é esse o import do router no index que queremos utilizar
  router.use(function timelog(req, res, next) {
    next();
    console.log("Time: ", Date.now());
  });


router.get("/personagens", async (req, res) => {
	res.send(await getPersonagensValidos());
});


module.exports = router;
