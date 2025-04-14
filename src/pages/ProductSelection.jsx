import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6">Please select a product and get details:</h2>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/granite/customer-details')}
            className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-lg"
          >
            Granite
          </button>
          <button
            onClick={() => alert('Block flow coming soon!')}
            className="w-full py-3 bg-gray-400 text-white rounded hover:bg-gray-500 text-lg"
          >
            Block
          </button>
        </div>
      </div>
    </div>
  );
}