import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function SheetsList() {
  const [sheets, setSheets] = useState([]);

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sheets'));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSheets(data);
      } catch (error) {
        console.error('Error fetching sheets:', error);
      }
    };

    fetchSheets();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Saved Sheets</h2>
      {sheets.length === 0 ? (
        <p>No sheets found.</p>
      ) : (
        sheets.map((sheet, index) => (
          <div key={sheet.id} className="mb-6 border p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Sheet #{index + 1}</h3>
            <p className="mb-2 font-medium">
              Total Sum: {sheet.totalSum?.toFixed(2)} ft²
            </p>
            <table className="min-w-full table-auto border">
              <thead>
                <tr>
                  <th className="border p-2">Length</th>
                  <th className="border p-2">Breadth</th>
                  <th className="border p-2">Unit</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Total Unit</th>
                </tr>
              </thead>
              <tbody>
                {sheet.measurements?.map((m, i) => (
                  <tr key={i}>
                    <td className="border p-2">{m.length}</td>
                    <td className="border p-2">{m.breadth}</td>
                    <td className="border p-2">{m.unit}</td>
                    <td className="border p-2">{m.total}</td>
                    <td className="border p-2">{m.totalUnit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
