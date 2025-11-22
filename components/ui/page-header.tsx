import React from 'react';

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b bg-white px-6 py-4">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
