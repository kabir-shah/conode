const express = require("express");
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

fs.readdir(path.resolve("../../dist"), (err, files) => {
	if (err) console.error(err);

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const fileType = path.extname(file);

		if (fileType === ".js" || fileType === ".css") {
			app.get("/" + path.basename(file), (req, res) => {
				res.sendFile(path.resolve(path.join("../../dist/", file)));
			});
		}
	}
});

function authenticated(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.redirect("/login");
	}
}

app.get("/", (req, res) => {
	res.sendFile(path.resolve("../../dist/index.html"));
});

app.get("/signup", (req, res) => {
	res.sendFile(path.resolve("../../dist/signup.html"));
});

app.get("/login", (req, res) => {
	res.sendFile(path.resolve("../../dist/login.html"));
});

app.post("/signup", (req, res) => {
	const { email, username, password } = req.body;
	Users.create({ email, username, password: bcrypt.hashSync(value, 12) })
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
