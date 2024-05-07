export const locales = [
        'an',
        'ar',
        'en',
        'es',
        'fr',
        'it',
        'nl',
        'pl',
        'pt',
        'ru',
        'tr',
        'zh',
        'bg',
        'br',
        'ca',
        'de',
        'el',
        'fa',
        'gl',
        'he',
        'hr',
        'hu',
        'ko',
        'lt',
        'lv',
        'mk',
        'nb',
        'ro',
        'sk',
        'sq',
        'sv',
        'sr',
        'val',
        'uk',
        'et',
        'eu',
] as const;

export function excludeLocales(keepLocales: string[]): string[] {
        const excluded = locales.filter((locale) => !keepLocales.includes(locale));
        const translationList = excluded.map((locale) => `translations.${locale}`);
        if(keepLocales.includes('fr')) translationList.push('translations.fr.lvf_entries');
        return translationList;
}