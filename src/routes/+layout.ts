import { browser } from '$app/environment';
import { addMessages, getLocaleFromNavigator, init, locale, waitLocale } from 'svelte-i18n';
import type { LayoutLoad } from './$types'
import fr from '$lib/i18n/fr.json';
import en from '$lib/i18n/en.json';

// Initialize i18n localization.
addMessages('en', en);
addMessages('fr', fr);

if (browser) {
	// Init on client side only. Don't put this inside `load`, otherwise
	// it will gets executed every time you changed route on client side.
	init({
		fallbackLocale: 'fr',
		initialLocale: getLocaleFromNavigator()
	});
}

// Wait for the locale to be set before rendering.
export const load: LayoutLoad = async () => {
	if (browser) {
		locale.set(getLocaleFromNavigator())
	}

	await waitLocale()
}
