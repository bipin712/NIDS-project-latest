import React from 'react';

export default function DataTable({ headers = [], children, empty = false, emptyState }) {
  return (
    <div className="overflow-x-auto w-full border border-[#e0e4e8] rounded-md">
      <table className="min-w-full divide-y divide-[#e0e4e8] text-left text-[13px] bg-white">
        <thead className="bg-[#f8f9fa] text-[#888888] font-semibold text-[11px] uppercase tracking-wider">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e0e4e8] text-[#333333]">
          {empty ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-[#888888]">
                {emptyState || 'No records found.'}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
