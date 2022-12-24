import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/api/ids');
	const jsonResponse = await response.json();

	let err = '';
	let ids = jsonResponse;

	if (response.status != 200) {
		err = jsonResponse.message ?? 'no error message';
		ids = [];
	}

	return {
		ids: ids,
		err: err
	};
};
