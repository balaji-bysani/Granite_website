import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    graniteName: '',
    partyName: '',
    date: '',
    image: null,
    vehicleNumber: '',
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleNext = () => {
    localStorage.setItem('customerDetails', JSON.stringify(formData));
    navigate('/granite/slab-measurements');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Customer Details</h2>
        <div className="space-y-4">
          <input type="text" name="graniteName" placeholder="Granite Name" value={formData.graniteName} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
          <input type="text" name="partyName" placeholder="Party Name" value={formData.partyName} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
          <input type="file" name="image" accept="image/*" onChange={handleChange} className="w-full px-4 py-2 border rounded" />
          <input type="text" name="vehicleNumber" placeholder="Truck/Vehicle Number (optional)" value={formData.vehicleNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
          <button onClick={handleNext} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Next</button>
        </div>
      </div>
    </div>
  );
}