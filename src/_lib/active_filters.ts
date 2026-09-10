import type {
  Field,
  FiltersType
} from '../components/SearchPage/filters/filter_types';
import { FormatIntl, Parse_EN_US } from './date_helper';

/** A filter field with its selectable options already resolved. */
export type ResolvedField = Omit<Field, 'options'> & {
  options: ResolvedOption[];
};

/** Option shapes the filter panel renders: `{id, name}` objects or bare numbers. */
export type ResolvedOption =
  | { id: string | number; name: string; country_id?: string; region?: string }
  | number
  | string;

/** One filter the visitor has set, ready to render as a removable pill. */
export type ActiveFilter = {
  /** Filter key, e.g. `countries` or `category_12`. */
  key: string;
  /** Field label as configured on the portal. */
  label: string;
  /** Human-readable value (option name, formatted date or raw value). */
  value: string;
  /** Pill text: `label: value`. */
  text: string;
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
};

/** Whether a filter value counts as "set": not null, undefined, empty string or empty list. */
export function hasFilterValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** A copy of `filters` without `key`; unlike setting null, the key is gone entirely. */
export function removeFilter(filters: FiltersType, key: string): FiltersType {
  const next: Record<string, unknown> = { ...filters };
  delete next[key];
  return next as FiltersType;
}

function isDateField(field: ResolvedField): boolean {
  return field.type === 'date' || field.id.endsWith('_date');
}

function optionName(field: ResolvedField, value: unknown): string | null {
  const wanted = String(value);
  for (const option of field.options) {
    if (typeof option === 'object') {
      if (String(option.id) === wanted) return option.name;
    } else if (String(option) === wanted) {
      return String(option);
    }
  }
  return null;
}

function formatDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return FormatIntl(Parse_EN_US(value), DATE_FORMAT);
}

function valueText(field: ResolvedField, value: unknown): string {
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .map((single) => {
      if (isDateField(field) && typeof single === 'string') {
        return formatDate(single);
      }
      return optionName(field, single) ?? String(single);
    })
    .join(', ');
}

/**
 * The filters that currently have a value, in panel order. Only keys backed by a
 * configured field are listed: nothing in the panel can set or clear the rest
 * (e.g. `properties` deep-linked from the URL).
 */
export function activeFilters(
  filters: FiltersType,
  fields: ResolvedField[]
): ActiveFilter[] {
  const values = filters as Record<string, unknown>;
  return fields
    .filter((field) => hasFilterValue(values[field.id]))
    .map((field) => {
      const label = field.label ?? field.id;
      const value = valueText(field, values[field.id]);
      return { key: field.id, label, value, text: `${label}: ${value}` };
    });
}
