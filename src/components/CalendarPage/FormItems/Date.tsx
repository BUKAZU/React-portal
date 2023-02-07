import React from 'react';
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  FormikProps
} from 'formik';
import { FormattedMessage } from 'react-intl';
import DatePicker from 'react-date-picker';
import { format } from 'date-fns';
import { PossibleValues } from '../formParts/form_types';

interface Props {
  label: string;
  description: string | React.ReactNode;
  name: string;
  inline: boolean;
  required: boolean;
}

type FieldType = {
  field: FieldInputProps<PossibleValues>;
  form: FormikProps<PossibleValues>;
  meta: FieldMetaProps<PossibleValues>;
};

function DateField({ label, description, name, inline }: Props) {
  return (
    <Field name={name}>
      {({ field, meta, form }: FieldType) => {
        const { value, name } = field;

        let tempval;
        if (value === '' || !value) {
          tempval = null;
        } else {
          tempval = new Date(value);
        }

        return (
          <div
            className={`form-row ${inline && 'inline'}`}
            id={`bukazu_form_${name}`}
          >
            <label htmlFor={name}>
              <FormattedMessage id={label} />
            </label>
            <DatePicker
              className="bukazu-date-picker"
              name={name}
              format="dd-MM-y"
              value={tempval}
              onChange={(e) => {
                field.onChange(format(e, 'yyyy-MM-dd'));
                form.setFieldValue(name, format(e, 'yyyy-MM-dd'));
              }}
            />
            <span className="bu-input-description">{description}</span>
            {meta.touched && meta.error && (
              <div className="error-message">{meta.error}</div>
            )}
          </div>
        );
      }}
    </Field>
  );
}

DateField.defaultValues = {
  inline: true
};

export default DateField;
