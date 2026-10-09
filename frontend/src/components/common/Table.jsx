import React from 'react';
import { classNames } from '../../utils/helpers';

const Table = ({ columns, data, loading, emptyMessage = "No data found." }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-t-md mb-2"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 mb-1 rounded-sm"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className={classNames(
                  "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row, rowIdx) => (
            <tr key={row.id || rowIdx} className="hover:bg-gray-50 transition-colors">
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={classNames(
                    "whitespace-nowrap px-6 py-4 text-sm text-gray-900",
                    col.cellClassName
                  )}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
