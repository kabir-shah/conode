const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const path = require("path");

const app = express();
const port = 3000;

const hbs = expressHandlebars.create({});

app.engine("handlebars", hbs.engine);
app.set("views", path.resolve("src/views"));
app.set("view engine", "handlebars");

app.use("/css", express.static(path.resolve("src/views/css")));
app.use("/js", express.static(path.resolve("src/views/js")));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost/Conode", {
	useNewUrlParser: true
});

app.get("/", (req, res) => {
	res.render("index", { projects: [{title: "get rekt"}] });
});

app.listen(port, () => console.log(`Conode is running on port ${port}.`));
