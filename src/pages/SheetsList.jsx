import React from 'react';
import { useLocation } from 'react-router-dom';

export default function SheetsList() {
  const location = useLocation();
  const { savedSheets } = location.state || { savedSheets: [] };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Saved Sheets</h2>
      {savedSheets.length > 0 ? (
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="border p-2">Length</th>
              <th className="border p-2">Breadth</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Unit</th>
            </tr>
          </thead>
          <tbody>
            {savedSheets.map((sheet, index) => (
              <tr key={index}>
                <td className="border p-2">{sheet.length}</td>
                <td className="border p-2">{sheet.breadth}</td>
                <td className="border p-2">{sheet.total}</td>
                <td className="border p-2">{sheet.totalUnit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No slabs saved yet.</p>
      )}
    </div>
  );
}
