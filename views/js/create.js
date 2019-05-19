var textarea = document.getElementById("content");

function resize() {
	textarea.style.height = textarea.scrollHeight + "px";
}

textarea.addEventListener("input", resize);
resize();