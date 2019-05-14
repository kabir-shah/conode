const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const hbs = expressHandlebars.create({});
const Schema = mongoose.Schema;
const port = 3000;

mongoose.connect("mongodb://localhost/Conode", {
	useCreateIndex: true,
	useNewUrlParser: true
});

const ProjectSchema = new Schema({
	id: {
		type: String,
		index: true,
		unique: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	title: String,
	author: String,
	description: String,
	image: String,
	content: String,
	likes: Number
});

const Project = mongoose.model("Project", ProjectSchema);

app.engine("handlebars", hbs.engine);
app.set("views", path.resolve("src/views"));
app.set("view engine", "handlebars");

app.use("/css", express.static(path.resolve("src/views/css")));
app.use("/js", express.static(path.resolve("src/views/js")));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	Project.find().sort({ date: -1 }).limit(10).sort({ likes: -1 }).then(projects => {
		res.render("index", { projects: [{title: "get rekt"}] });
	}).catch(err => {
		res.send("There was an error fetching the projects.");
	});
});

app.post("/create", (req, res) => {
	Project.create(req.body, (err, project) => {
		if (err) {
			res.send("There was an error creating the project.");
		} else {
			res.redirect("/projects/" + project.id);
		}
	});
});

app.listen(port, () => console.log(`Conode is running on port ${port}.`));
