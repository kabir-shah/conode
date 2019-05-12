import Moon from "./lib/moon.min.js";

Moon({
	root: "#root",
    view: document.getElementById("template").textContent,
    projects: [{image: "https://www.clker.com/cliparts/3/m/v/Y/E/V/small-red-apple-hi.png", name: "test project", description: "a project for testing display"}, 
    {image: "https://www.clker.com/cliparts/3/m/v/Y/E/V/small-red-apple-hi.png", name: "test project", description: "a project for testing display"}]
});
