import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface FormCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function FormCard({ title, children, actions }: FormCardProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {actions}
        </div>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}
