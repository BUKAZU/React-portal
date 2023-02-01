import nl from './countries/nl.json';
import en from './countries/en.json';
import de from './countries/de.json';
import fr from './countries/fr.json';
import es from './countries/es.json';
import it from './countries/it.json';

export const Countries: CountriesType = {
  en,
  nl,
  de,
  fr,
  es,
  it
};

type CountriesType = {
  en: CountryJsonType[];
  nl: CountryJsonType[];
  de: CountryJsonType[];
  fr: CountryJsonType[];
  es: CountryJsonType[];
  it: CountryJsonType[];
};

type CountryJsonType = {
  name: string;
  alpha2: string;
};
