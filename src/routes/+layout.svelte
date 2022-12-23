<script lang="ts">
	import "../app.css";
</script>

<slot />

<style>
	/* Use Roboto font. */
	@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

	:global(body) {
		background-color: #121212;
		color: #ffffff;
		font-family: 'Roboto', sans-serif;
	}
</style>
