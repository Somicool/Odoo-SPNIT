import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface KpiCardProps {
  title: string;
  stats: {
    label: string;
    value: number | string;
  }[];
  onClick?: () => void;
}

export function KpiCard({ title, stats, onClick }: KpiCardProps) {
  const gradientClass = title === 'Receipt' 
    ? 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
    : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';

  return (
    <Card 
      className={`${gradientClass} cursor-pointer transition-all hover:shadow-2xl text-white transform hover:-translate-y-1 border-0`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between text-sm bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-white font-medium">{stat.label}</span>
            <span className="font-semibold text-white">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
