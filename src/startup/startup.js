'use strict';

require([
	'wrapper/chrome',
	'storage/chrome-storage',
	'vendor/showdown.min'
], (chrome, ChromeStorage, showdown) => {
	/**
	 * Run initialization
	 */
	init();

	function init() {
		$('#opt-in').click(() => {
			updateGaState(false).then(closePage);
		});

		$('#opt-out').click(() => {
			updateGaState(true).then(closePage);
		});

		preparePrivacyPolicy();
	}

	function closePage() {
		window.close();
		// $('.controls').hide();
		// $('.finished').show();
	}

	async function updateGaState(value) {
		const options = ChromeStorage.getStorage(ChromeStorage.OPTIONS);

		let data = await options.get();
		data.disableGa = value;
		await options.set(data);
	}

	async function preparePrivacyPolicy() {
		const locale = chrome.i18n.getMessage('@@ui_locale');
		const defaultPrivacyDoc = 'PRIVACY.md';
		let privacyDocs = [defaultPrivacyDoc];

		if (!locale.startsWith('en')) {
			let localeSplit = locale.split('_');
			privacyDocs.unshift(`PRIVACY.${localeSplit[0]}.md`);
			privacyDocs.unshift(`PRIVACY.${locale}.md`);
		}

		for (let privacyDoc of privacyDocs) {
			console.log(`fetching ${privacyDoc}`);
			try {
				const response = await fetch(chrome.runtime.getURL(privacyDoc));
				const markdown = await response.text();
				let converter = new showdown.Converter();
				let content = converter.makeHtml(markdown);
				$('.privacy-policy').html(content);
				break;
			} catch (err) {
				console.log(`Failed to load ${privacyDoc}, reason: ${err.message}`);
			}
		}
	}
});
