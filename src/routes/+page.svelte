<script>
let data = 0;
let err = "";

async function fetchData() {
	const response = await fetch('/api/data');

	let resp = await response.json();
	console.log(resp)
}
</script>

Data: {data}
Error: {err}

<button on:click={fetchData}>Fetch data</button>
