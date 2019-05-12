const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const Schema = mongoose.Schema;
const app = express();
const port = 3000;

mongoose.connect("mongodb://localhost/Conode", {
	useNewUrlParser: true
});

const User = new Schema({
	username: String,
	email: String,
	password: String
});

const Users = mongoose.model("Users", User);

const hbs = expressHandlebars.create({});

app.engine("handlebars", hbs.engine);
app.set("views", path.resolve("src/views"));
app.set("view engine", "handlebars");
app.use("/css", express.static(path.resolve("src/views/css")));
app.use("/js", express.static(path.resolve("src/views/js")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
	resave: false,
	saveUninitialized: true,
	secret: "this is secret"
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser((id, done) => {
	Users.findById(id, (err, user) => done(err, user));
});

passport.use("local", new LocalStrategy((email, password, done) => {
	Users.findOne({ email })
		.then(user => {
			if (!user || !bcrypt.compareSync(password, user.password)) {
				done(null, false, { message: "Invalid email or password" });
			} else {
				done(null, user);
			}
		})
		.catch(err => done(err));
}));

function authenticated(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.redirect("/login");
	}
}

app.get("/", (req, res) => {
	if (req.user) {
		res.render("index", { username: req.user.username });
	} else {
		res.render("index");
	}
});

app.get("/signup", (req, res) => {
	res.render("signup");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
});

app.post("/signup", (req, res) => {
	const { email, username, password } = req.body;
	Users.create({ email, username, password: bcrypt.hashSync(password, 12) })
		.then(user => {
			req.login(user, err => {
				if (err) {
					next(err);
				} else {
					res.redirect("/");
				}
			});
		})
		.catch(err => {
			if (err.name === "ValidationError") {
				res.redirect("/register");
			} else {
				next(err);
			}
		});
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/",
	failureRedirect: "/login"
}));

app.listen(port, () => {
	console.log(`Conode started on port ${port}`);
});
