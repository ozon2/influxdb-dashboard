import { browser } from '$app/environment';
import { addMessages, getLocaleFromNavigator, init } from 'svelte-i18n';
import en from '$lib/i18n/en.json';
import fr from '$lib/i18n/fr.json';

// Initialize i18n localization.
addMessages('en', en);
addMessages('fr', fr);

if (browser) {
	// init on client side only
	// don't put this inside `load`, otherwise it will gets executed every time you changed route on client side
	init({
		fallbackLocale: 'en',
		initialLocale: getLocaleFromNavigator()
	});
}
