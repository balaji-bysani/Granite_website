import React, { useEffect, useState } from 'react';

export default function SheetsList() {
  const [sheets, setSheets] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('sheets')) || [];
    setSheets(data);
  }, []);

  if (sheets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div>No sheets available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Saved Sheets</h2>

        {sheets.map((sheet, sheetIndex) => {
          const sum = sheet.rows.reduce(
            (acc, row) => acc + (parseFloat(row.total) || 0),
            0
          ).toFixed(2);

          return (
            <div key={sheetIndex} className="mb-8 bg-white p-6 rounded shadow-md">
              <div className="mb-4 text-sm text-gray-500">
                Saved on: {new Date(sheet.timestamp).toLocaleString()}
              </div>

              <table className="w-full border border-gray-300 text-center">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2">Length ({sheet.units.length})</th>
                    <th className="p-2">Breadth ({sheet.units.breadth})</th>
                    <th className="p-2">Total ({sheet.units.total})</th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t">
                      <td className="p-2">{row.length}</td>
                      <td className="p-2">{row.breadth}</td>
                      <td className="p-2">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right mt-4 font-semibold">
                Total: {sum} {sheet.units.total}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
