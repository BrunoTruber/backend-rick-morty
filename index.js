const express = require("express");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
require("dotenv").config();
require("express-async-errors");
var cors = require('cors');

//requires de endpoints
const home = require("./components/home/home");
//const read_all = require("./components/read-all/read-all");
//const readById = require("./components/read-by-id/read-by-id");
// const update = require("./components/update/update");
//const create = require("./components/create/create");
// const deletar = require("./components/delete/delete");

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

	console.info("Conexão estabelecida com o MongoDB Atlas")

	const db = client.db("blue_db");
	const personagens = db.collection("personagens");

	const getPersonagensValidos = () => personagens.find({}).toArray();

	const getPersonagemById = async (id) =>
		personagens.findOne({ _id: ObjectId(id) });

	

	//CORS

	// app.all("/*", (req, res, next) => {
	// 	res.header(
	// 		"Access-Control-Allow-Origin", "*");

	// 	res.header("Access-Control-Allow-Methods", "*");

	// 	res.header(
	// 		"Access-Control-Allow-Headers",
	// 		"Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization"
	// 	);
	// 	next();
	// });

// novo CORS
// liberar o CORS em todas as requisições
app.use(cors());
//ativar todos os pre-flights
app.options('*', cors());


	// //[GET] - Home
	// app.get("/", async (req, res) => {
	// 	res.send({ info: "Olá, Blue" });
	// });
	app.use('/home', home);

	//[GET] getAllPersonagens
	app.get("/personagens", async (req, res) => {
		res.send(await getPersonagensValidos());
	});

	//[GET] getPersonagemById
	app.get("/personagens/:id", async (req, res) => {
		const id = req.params.id;
		const personagem = await getPersonagemById(id);
		if(!personagem){
			res.status(404).send({error: "o persoangem especificado nao foi encontrado"});
			return;
		}
		res.send(personagem);
	});
	//  app.use("/personagens/read-by-id", readById);
    
    // [POST] postPersonagem - criar personagenm
	app.post("/personagens", async (req, res) => {
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

	//[PUT] Atualizar personagem
	app.put("/personagens/:id", async (req, res) => {
		const id = req.params.id;
		const objeto = req.body;

		if (!objeto || !objeto.nome || !objeto.imagemUrl) {
			res.status(400).send(
				{error: "Requisição inválida, certifique-se que tenha os campos nome e imagemUrl"}
			);
			return;
		}

		const quantidadePersonagens = await personagens.countDocuments({
			_id: ObjectId(id),
		});

		if(quantidadePersonagens !== 1){
			res.status(404).send({error: 'personagem nao encontrado'})
		}

		const result = await personagens.updateOne(
			{
				_id: ObjectId(id),
			},
			{
				$set: objeto,
			}
			);
			//se acontecer algum erro no mongodb, vai cair nesta validação
			if(result.acknowledged == 'undefined'){
				res.status(500).send({error: 'ocorreu um erro ao atualizar o personagem'})
				return;
			}
			res.send(await getPersonagemById(id));
	});

	//[DELETE] deleta um personagem
	app.delete("/personagens/:id", async (req, res) => {
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
	//tratamento de erros
	//middleware verifica end points
	app.all("*", function (req, res) {
		res.status(404).send({ message: "Endpoint was not found" });
	});

	//middleware - Tratamento de erro
	app.use((error, req, res, next) => {
		res.status(error.status || 500).send({
			error: {
				status: error.status || 500,
				message: error.message || "internal server Error",
			},
		});
	});


	app.listen(port, () => {
		console.info(`App rodando em http://localhost:${port}`);
	});
})();