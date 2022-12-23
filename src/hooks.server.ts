import type { Handle } from '@sveltejs/kit';
import { locale } from 'svelte-i18n';

// Set locale on server to make i18n work with SSR.
export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get('accept-language')?.split(',')[0];
	if (lang) {
		locale.set(lang);
	}

	return resolve(event);
};
