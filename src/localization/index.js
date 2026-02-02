const importMetaGlob = import.meta?.glob;
const localizedStringsUrls =
    typeof importMetaGlob === 'function'
        ? importMetaGlob('./*.json', {
              eager: true,
              query: '?url',
              import: 'default'
          })
        : {};

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        console.warn(`Failed to fetch localization: ${response.status}`);
    }
    return response.json();
}

async function getLocalizedStrings(code) {
    const fallbackUrl = localizedStringsUrls['./en.json'];
    if (!fallbackUrl) {
        return {};
    }
    const localizedStringsUrl =
        localizedStringsUrls[`./${code}.json`] || fallbackUrl;

    let localizedStrings = {};
    try {
        localizedStrings = await fetchJson(localizedStringsUrl);
    } catch {
        if (localizedStringsUrl !== fallbackUrl) {
            localizedStrings = await fetchJson(fallbackUrl).catch(() => ({}));
        }
    }

    return localizedStrings;
}

const languageNames =
    typeof importMetaGlob === 'function'
        ? importMetaGlob('./*.json', {
              eager: true,
              import: 'language'
          })
        : {};

function getLanguageName(code) {
    return String(languageNames[`./${code}.json`] ?? code);
}

export * from './locales';
export { getLanguageName, getLocalizedStrings };
