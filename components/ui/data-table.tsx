import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

interface DataTableProps<T> {
  columns: {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
  }[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({ columns, data, onRowClick }: DataTableProps<T>) {
  return (
    <div className="rounded-lg border-2 border-blue-100 bg-white shadow-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
            {columns.map((column, index) => (
              <TableHead key={index} className={`font-semibold text-gray-900 ${column.className}`}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={onRowClick ? "cursor-pointer hover:bg-blue-50 transition-colors" : "hover:bg-gray-50"}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.className}>
                    {typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : String(item[column.accessor])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
