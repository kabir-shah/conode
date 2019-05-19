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
					<input type="number" name="skill" placeholder="Average skill level in topics from 0-100"/>
					<input type="number" name="max" placeholder="Maximum number of members"/>
					<button>Create a team</button>
				</form>
			</if>
			<else-if={state === "join-code"}>
				<form action={"/projects/" + projectId + "/teams/join-code"} method="POST">
					<input type="text" name="name" placeholder="Name"/>
					<input type="email" name="email" placeholder="Email"/>
					<input type="text" name="code" placeholder="Team code"/>
					<button>Join a team</button>
				</form>
			</else-if>
			<else>
				<form action={"/projects/" + projectId + "/teams/join-skill"} method="POST">
					<input type="text" name="name" placeholder="Name"/>
					<input type="email" name="email" placeholder="Email"/>

					<h5>Skill Level</h5>
					<for={$topic} of={projectTopics}>
						<input type="number" name={"topic-" + $topic} placeholder={"Proficiency in " + $topic + " from 0-100"}/>
					</for>
					<button>Join a team</button>
				</form>
			</else>
		</div>
	`,
	projectId: window.projectId,
	projectTopics: window.projectTopics,
	state: "create",
	changeState(state) {
		Moon.set({ state });
	}
});
