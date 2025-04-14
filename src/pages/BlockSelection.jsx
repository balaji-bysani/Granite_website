import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BlockSelection() {
  const navigate = useNavigate();
  const [blockNumber, setBlockNumber] = useState('');

  const handleViewSlabs = () => {
    if (blockNumber.trim()) {
      navigate(`/block/slabs/${blockNumber}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Enter Block Number</h2>
        <input
          type="text"
          value={blockNumber}
          onChange={(e) => setBlockNumber(e.target.value)}
          placeholder="Block Number"
          className="w-full px-4 py-2 mb-4 border rounded"
        />
        <button
          onClick={handleViewSlabs}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          View Slabs
        </button>
      </div>
    </div>
  );
}
