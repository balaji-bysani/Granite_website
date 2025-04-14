import React, { useState, useEffect } from 'react';

export default function SlabMeasurements() {
  const [measurements, setMeasurements] = useState([
    { length: '', breadth: '', total: '', unit: 'ft', totalUnit: 'ft' },
  ]);

  const [totalSum, setTotalSum] = useState(0);

  // Convert any unit to feet for calculation purposes
  const convertToFeet = (value, unit) => {
    if (!value) return 0;

    switch (unit) {
      case 'm': return value * 3.28084; // 1 meter = 3.28084 feet
      case 'in': return value / 12; // 1 inch = 1/12 feet
      case 'ft': return value; // Already in feet
      case 'cm': return value / 30.48; // 1 cm = 1/30.48 feet
      default: return value;
    }
  };

  // Convert feet to the selected total unit
  const convertTotalUnit = (value, totalUnit) => {
    switch (totalUnit) {
      case 'm':
        return value / 10.7639; // 1 ft² = 0.092903 m²
      case 'cm':
        return value * 929.0304; // 1 ft² = 929.0304 cm²
      case 'in':
        return value * 144; // 1 ft² = 144 in²
      case 'ft':
        return value; // Already in ft²
      default:
        return value;
    }
  };

  // Calculate total based on the selected measuring units
  const calculateTotal = (length, breadth, unit) => {
    let total = 0;
    const lengthInFeet = convertToFeet(length, unit);
    const breadthInFeet = convertToFeet(breadth, unit);
    total = lengthInFeet * breadthInFeet;
    return total;
  };

  // Update total when length, breadth, or measuring units change
  useEffect(() => {
    let sum = 0;
    const newMeasurements = measurements.map((measurement) => {
      const { length, breadth, unit, totalUnit } = measurement;
      const total = calculateTotal(length, breadth, unit);
      const convertedTotal = convertTotalUnit(total, totalUnit);
      return {
        ...measurement,
        total: convertedTotal.toFixed(2),
      };
    });

    // Update total sum
    newMeasurements.forEach((measurement) => {
      const total = parseFloat(measurement.total);
      sum += total;
    });

    setTotalSum(sum);
    setMeasurements(newMeasurements);
  }, [measurements]);

  const handleChange = (e, index, field) => {
    const newMeasurements = [...measurements];
    newMeasurements[index][field] = e.target.value;
    setMeasurements(newMeasurements);
  };

  const handleUnitChange = (e, index, field) => {
    const newMeasurements = [...measurements];
    newMeasurements[index][field] = e.target.value;
    setMeasurements(newMeasurements);
  };

  const handleDeleteRow = (index) => {
    const newMeasurements = [...measurements];
    newMeasurements.splice(index, 1);
    setMeasurements(newMeasurements);
  };

  // Automatically add a new row when the last one is filled
  useEffect(() => {
    if (measurements[measurements.length - 1].length !== '' &&
        measurements[measurements.length - 1].breadth !== '') {
      setMeasurements([
        ...measurements,
        { length: '', breadth: '', total: '', unit: 'ft', totalUnit: 'ft' },
      ]);
    }
  }, [measurements]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Slab Measurements</h2>

      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="border p-2">Length</th>
            <th className="border p-2">Breadth</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((measurement, index) => (
            <tr key={index}>
              <td className="border p-2">
                <input
                  type="number"
                  value={measurement.length}
                  onChange={(e) => handleChange(e, index, 'length')}
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Length"
                />
                <select
                  value={measurement.unit}
                  onChange={(e) => handleUnitChange(e, index, 'unit')}
                  className="mt-1 p-1 border rounded w-full"
                >
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                  <option value="ft">ft</option>
                  <option value="in">in</option>
                </select>
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={measurement.breadth}
                  onChange={(e) => handleChange(e, index, 'breadth')}
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Breadth"
                />
                <select
                  value={measurement.unit}
                  onChange={(e) => handleUnitChange(e, index, 'unit')}
                  className="mt-1 p-1 border rounded w-full"
                >
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                  <option value="ft">ft</option>
                  <option value="in">in</option>
                </select>
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  value={measurement.total}
                  disabled
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Total"
                />
                <select
                  value={measurement.totalUnit}
                  onChange={(e) => handleUnitChange(e, index, 'totalUnit')}
                  className="mt-1 p-1 border rounded w-full"
                >
                  <option value="ft">ft²</option>
                  <option value="cm">cm²</option>
                  <option value="m">m²</option>
                  <option value="in">in²</option>
                </select>
              </td>
              <td className="border p-2">
                <button
                  type="button"
                  onClick={() => handleDeleteRow(index)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right">
        <strong>Total Sum: {totalSum.toFixed(2)} ft²</strong>
      </div>
    </div>
  );
}
