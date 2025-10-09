import { createIntl, createIntlCache } from '@formatjs/intl'

const cache = createIntlCache()

import en from './locales/en.json';
import nl from './locales/nl.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import it from './locales/it.json';


const messages = {
    nl: {
        ...nl
    },
    en: {
        ...en
    },
    de: {
        ...de
    },
    fr: {
        ...fr
    },
    es: {
        ...es
    },
    it: {
        ...it
    }
}

export function useLocale() {
    const locale = window.__localeId__;

    const intl = createIntl({
        locale,
        messages: messages[locale]
    }, cache)

    return intl
}