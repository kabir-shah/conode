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
	likes: Number,
	topics: [String]
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
		const fakeProjects = [];

		for (let i = 0; i < 10; i++) {
			fakeProjects.push({
				id: 1,
				date: Date.now(),
				title: "Lorem Ipsum",
				author: "Jane Doe",
				description: "Lorem ipsum dolor amet fashion axe post-ironic green juice cornhole vaporware asymmetrical shaman health goth etsy 90's. Hell of keffiyeh yuccie gastropub, pickled pok pok portland air plant kitsch slow-carb fixie iPhone blue bottle. Jianbing hoodie everyday carry pinterest.",
				image: "https://unsplash.com/photos/6sMGdkj3Ywg/download?force=true",
				content: "Some sick content here.",
				likes: 1000,
				topics: ["JavaScript", "Python", "Mr. Brown", "Organic Chemistry"]
			});
		}

		res.render("index", {projects: fakeProjects});
		// res.render("index", { projects });
	}).catch(err => {
		res.send("There was an error fetching the projects.");
	});
});

app.get("/create", (req, res) => {
	res.render("create");
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
