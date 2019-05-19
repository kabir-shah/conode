Moon({
	root: "#root",
	view: `
		<div id="forms">
			<h1>Teams</h1>

			<ul class="tabs">
				<li @click={changeState("create")} class={"tab" + (state === "create" ? " tab-active" : "")}><p>Create</p></li>
				<li @click={changeState("join-code")} class={"tab" + (state === "join-code" ? " tab-active" : "")}><p>Join with code</p></li>
				<li @click={changeState("join-skill")} class={"tab" + (state === "join-skill" ? " tab-active" : "")}><p>Join based on skill</p></li>
			</ul>

			<if={state === "create"}>
				<form action={"/projects/" + projectId + "/teams/create"} method="POST">
					<input type="text" name="name" placeholder="Name"/>
					<input type="email" name="email" placeholder="Email"/>
					<input type="number" id="max" name="max" placeholder="Maximum number of members"/>
					<button>Create a team</button>
				</form>
			</if>
			<else-if={state === "join-code"}>
				<form action={"/projects/" + projectId + "/teams/join-code"} method="POST">
					<input type="text" name="name" placeholder="Name"/>
					<input type="email" name="email" placeholder="Email"/>
					<input type="text" id="code" name="code" placeholder="Team code"/>
					<button>Join a team</button>
				</form>
			</else-if>
			<else>
				<form action={"/projects/" + projectId + "/teams/join-skill"} method="POST">
					<input type="text" name="name" placeholder="Name"/>
					<input type="email" name="email" placeholder="Email"/>
					<button>Join a team</button>
				</form>
			</else>
		</div>
	`,
	projectId: window.location.pathname.split("/")[2],
	state: "create",
	changeState(state) {
		Moon.set({ state });
	}
});
