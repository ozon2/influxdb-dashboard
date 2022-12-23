import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	return {
		response: await fetch("/api/ids")
	};
};
