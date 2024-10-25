import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function CostSection({ children }: Props): JSX.Element {
  return (
    <div className="w-full p-2">
      <table className="w-full">
        <tbody className="w-full">{children}</tbody>
      </table>
    </div>
  );
}
