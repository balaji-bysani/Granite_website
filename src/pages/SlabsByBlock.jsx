import React from 'react';
import { useParams } from 'react-router-dom';

export default function SlabsByBlock() {
  const { blockNumber } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Slabs for Block: <span className="text-blue-600">{blockNumber}</span>
        </h2>
        {/* You can replace the below section with actual slab details fetching from your backend */}
        <div className="text-center text-gray-600">
          Slab details for Block <strong>{blockNumber}</strong> will be displayed here.
        </div>
      </div>
    </div>
  );
}