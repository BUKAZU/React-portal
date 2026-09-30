import React, { useEffect, useState } from 'react';
import { Field } from './filter_types';

interface Props {
  value: string | null | undefined;
  onChange: Function;
  field: Field;
}

// Browsers update a date input's value while its picker is still open (e.g.
// when paging to another month). Committing that value moves the field into
// the active-filter pills, unmounting the input and closing the picker, so we
// keep a draft and only commit once the user leaves the field or hits Enter.
function DateFilter({ value, onChange, field }: Props): JSX.Element {
  const committed = value ?? '';
  const [draft, setDraft] = useState(committed);

  useEffect(() => {
    setDraft(committed);
  }, [committed]);

  function commit() {
    if (draft !== committed) onChange(field.id, draft);
  }

  return (
    <input
      type="date"
      id={field.id}
      name={field.id}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
      }}
    />
  );
}

export default DateFilter;
