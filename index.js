const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const marked = require("marked");
const moment = require("moment");
const path = require("path");

const app = express();
const hbs = expressHandlebars.create({});
const Schema = mongoose.Schema;
const port = 3000;

const renderer = new marked.Renderer();

renderer.listitem = text => `<li><p>${text}</p></li>`;

mongoose.connect(`mongodb+srv://${process.env.CONODE_USER}:${process.env.CONODE_PASSWORD}@conode-x8avs.mongodb.net/Conode?retryWrites=true`, {
	useCreateIndex: true,
	useNewUrlParser: true
});

const TeamMemberSchema = new Schema({
	name: String,
	email: String
});

const TeamSchema = new Schema({
	members: [TeamMemberSchema],
	skill: Number,
	max: Number
});

const ProjectSchema = new Schema({
	date: {
		type: Date,
		default: Date.now
	},
	title: String,
	author: String,
	description: String,
	image: String,
	content: String,
	topics: [String],
	teams: [TeamSchema]
});

const Project = mongoose.model("Project", ProjectSchema);

function projectFormatted(project) {
	return {
		...project.toObject(),
		content: marked(project.content, { renderer }),
		date: moment(project.date).format("MMMM D, YYYY")
	};
}

app.engine("handlebars", hbs.engine);
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "handlebars");

app.use("/css", express.static(path.join(__dirname, "/views/css")));
app.use("/js", express.static(path.join(__dirname, "/views/js")));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	Project.find().sort({ date: -1 }).then(projects => {
		res.render("index", { projects });
	}).catch(err => {
		res.send("There was an error fetching the projects.");
	});
});

app.get("/projects/create", (req, res) => {
	res.render("create");
});

app.get("/projects/:id", (req, res) => {
	Project.findById(req.params.id).then(project => {
		res.render("project", {
			project: projectFormatted(project)
		});
	}).catch(err => {
		res.send("There was an error fetching the project.");
	});
});

app.get("/projects/:projectId/teams/:teamId", (req, res) => {
	Project.findById(req.params.projectId).then(project => {
		const team = project.teams.id(req.params.teamId);

		if (team) {
			res.render("team", { project: projectFormatted(project), team });
		} else {
			res.end("There was an error fetching the team.");
		}
	}).catch(err => {
		res.end("There was an error fetching the project.");
	});
});

app.post("/projects/create", (req, res) => {
	req.body.topics = req.body.topics.split(",").map(str => str.trim());

	Project.create(req.body, (err, project) => {
		if (err) {
			res.send("There was an error creating the project.");
		} else {
			res.redirect("/projects/" + project._id);
		}
	});
});

app.post("/projects/:id/teams/create", (req, res) => {
	Project.findById(req.params.id).then(project => {
		project.teams.push({
			members: [{
				name: req.body.name,
				email: req.body.email
			}],
			skill: req.body.skill,
			max: req.body.max
		});

		project.save().then(() => {
			res.redirect(`/projects/${project._id}/teams/${project.teams[project.teams.length - 1]._id}`);
		}).catch(err => {
			res.end("There was an error creating the team.");
		});
	}).catch(err => {
		res.send("There was an error fetching the project for the team.");
	});
});

app.post("/projects/:id/teams/join-code", (req, res) => {
	Project.findById(req.params.id).then(project => {
		const team = project.teams.id(req.body.code);

		if (team) {
			if (team.members.length === team.max) {
				res.end("The provided team is full.");
			} else {
				team.members.push({
					name: req.body.name,
					email: req.body.email
				});

				project.save().then(() => {
					res.redirect(`/projects/${project._id}/teams/${team._id}`);
				}).catch(err => {
					res.end("There was an error joining the team.");
				});
			}
		} else {
			res.end("There was an error fetching the team.");
		}
	}).catch(err => {
		res.send("There was an error fetching the project for the team.");
	});
});

app.post("/projects/:id/teams/join-skill", (req, res) => {
	Project.findById(req.params.id).then(project => {
		let team;
		let topicsLength = 0;

		const testSkill = Object.keys(req.body).reduce((total, topic) => {
			if (topic.slice(0, 6) === "topic-") {
				topicsLength += 1;
				return total + parseInt(req.body[topic], 10);
			} else {
				return total;
			}
		}, 0) / topicsLength;

		for (let i = 0; i < project.teams.length; i++) {
			const testTeam = project.teams[i];

			if (
					testTeam.members.length !== testTeam.max &&
					Math.abs(testTeam.skill - testSkill) < (100 / 3)
			) {
				team = testTeam;
			}
		}

		if (team) {
			team.members.push({
				name: req.body.name,
				email: req.body.email
			});

			project.save().then(() => {
				res.redirect(`/projects/${project._id}/teams/${team._id}`);
			}).catch(err => {
				res.end("There was an error joining the team.");
			});
		} else {
			res.end("There were no teams available for your skill level.");
		}
	}).catch(err => {
		res.send("There was an error fetching the project for the team.");
	});
});

app.listen(port, () => console.log(`Conode is running on port ${port}.`));
