import React from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import Description from './Description';

interface Props {
  name: string;
  amount: number;
  description?: string | React.ReactNode;
  method_name?: string;
  formatName?: boolean;
  forceMethod?: boolean;
}

function CostRow({
  name,
  amount,
  description,
  method_name,
  formatName,
  forceMethod
}: Props): JSX.Element {
  return (
    <tr>
      <td>
        {formatName ? <FormattedMessage id={name} /> : name}
        {description && (
          <>
            {' '}
            <Description description={description} />
          </>
        )}
      </td>

      <td className="price">
        {amount && amount > 0 ? (
          <>
            €{' '}
            <FormattedNumber
              value={amount}
              minimumFractionDigits={2}
              maximumFractionDigits={2}
            />
            {forceMethod && <> {method_name}</>}
          </>
        ) : (
          <>{method_name}</>
        )}
      </td>
    </tr>
  );
}

CostRow.defaultValues = {
  formatName: false,
  forceMethod: false
};

export default CostRow;
