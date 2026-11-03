import type { ResolvedOption } from '../../../_lib/active_filters';
import type { Field } from './filter_types';

export function createNumberArray(max_number: number): number[] {
  return Array.from({ length: max_number + 1 }, (v, k) => k);
}

export function createPriceArray(max_price: number): number[] {
  let rounded = Math.ceil(max_price / 100);
  return Array.from({ length: rounded + 1 }, (v, k) => k * 100);
}

/** Numeric filters the API may type oddly; they always render as a select. */
const NUMERIC_SELECT_FIELDS = [
  'persons_min',
  'persons_max',
  'bedrooms_min',
  'bathrooms_min',
  'weekprice_max'
];
const VALID_TYPES = ['select', 'list', 'radio', 'number', 'date'];

/** Field types rendered by a single form control that a `<label for>` can target. */
const LABELABLE_TYPES = ['select', 'number', 'date', 'text'];

/**
 * The control a field renders as: its API type, except that numeric fields
 * with an unknown type fall back to a select; anything else unknown is text.
 */
export function resolveFieldType(field: Field): string {
  if (VALID_TYPES.includes(field.type)) return field.type;
  return NUMERIC_SELECT_FIELDS.includes(field.id) ? 'select' : 'text';
}

/** Whether the field renders one control with `id={field.id}` for its label to point at. */
export function isLabelableField(field: Field): boolean {
  return LABELABLE_TYPES.includes(resolveFieldType(field));
}

/** Filter ids whose options may still come from the legacy house-derived facets. */
const FACET_FIELDS = ['countries', 'cities', 'regions'];

/**
 * The options a filter field offers: the API-supplied list, else a generated
 * numeric range (`max`), else the legacy facet list on the portal site.
 */
export function resolveFieldOptions(
  field: Field,
  facets: Record<string, unknown>
): ResolvedOption[] {
  if (field.options) {
    return field.options;
  }
  if (field.max !== undefined) {
    return field.id === 'weekprice_max'
      ? createPriceArray(field.max)
      : createNumberArray(field.max);
  }
  if (FACET_FIELDS.includes(field.id)) {
    const facet = facets[field.id];
    return Array.isArray(facet) ? (facet as ResolvedOption[]) : [];
  }
  return [];
}
