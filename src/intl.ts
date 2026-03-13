import en from './locales/en.json';
import nl from './locales/nl.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import it from './locales/it.json';

type Messages = { [key: string]: string };

const messages: { [locale: string]: Messages } = { en, nl, de, fr, es, it };

export function t(id: string, values?: Record<string, string | number>): string {
    const locale = (typeof window !== 'undefined' && window.__localeId__) || 'en';
    const localeMessages = messages[locale] || messages['en'];
    let message = localeMessages[id] || id;

    if (values) {
        Object.entries(values).forEach(([key, value]) => {
            message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        });
    }

    return message;
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    const locale = (typeof window !== 'undefined' && window.__localeId__) || 'en';
    return new Intl.NumberFormat(locale, options).format(value);
}

export function useLocale() {
    return {
        formatMessage: (descriptor: { id: string }, values?: Record<string, string | number>) =>
            t(descriptor.id, values)
    };
}