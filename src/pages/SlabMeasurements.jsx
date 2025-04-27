import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function SlabMeasurements() {
  const [measurements, setMeasurements] = useState([
    { length: "", breadth: "", total: "", unit: "ft", totalUnit: "ft" },
  ]);

  const [totalSum, setTotalSum] = useState(0);
  const navigate = useNavigate();

  const convertToFeet = (value, unit) => {
    if (!value) return 0;
    switch (unit) {
      case "m":
        return value * 3.28084;
      case "in":
        return value / 12;
      case "cm":
        return value / 30.48;
      case "ft":
        return value;
      default:
        return value;
    }
  };

  const convertTotalUnit = (value, totalUnit) => {
    switch (totalUnit) {
      case "m":
        return value / 10.7639;
      case "cm":
        return value * 929.0304;
      case "in":
        return value * 144;
      case "ft":
        return value;
      default:
        return value;
    }
  };

  const calculateTotal = (length, breadth, unit) => {
    const lengthInFeet = convertToFeet(length, unit);
    const breadthInFeet = convertToFeet(breadth, unit);
    return lengthInFeet * breadthInFeet;
  };

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

  // Auto add new row
  useEffect(() => {
    const lastRow = measurements[measurements.length - 1];
    if (lastRow.length !== "" && lastRow.breadth !== "") {
      setMeasurements([
        ...measurements,
        { length: "", breadth: "", total: "", unit: "ft", totalUnit: "ft" },
      ]);
    }
  }, [measurements]);

  // 🔥 SAVE to Firebase
  const handleSave = async () => {
    try {
      await addDoc(collection(db, "sheets"), {
        measurements: measurements.filter((m) => m.length && m.breadth),
        totalSum,
        createdAt: new Date(),
      });
      alert("Sheet saved!");
      navigate("/SheetsList"); // navigate to your SheetsList page
    } catch (error) {
      console.error("Error saving sheet:", error);
      alert("Failed to save. Please try again.");
    }
  };

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
                  onChange={(e) => handleChange(e, index, "length")}
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Length"
                />
                <select
                  value={measurement.unit}
                  onChange={(e) => handleUnitChange(e, index, "unit")}
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
                  onChange={(e) => handleChange(e, index, "breadth")}
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Breadth"
                />
                <select
                  value={measurement.unit}
                  onChange={(e) => handleUnitChange(e, index, "unit")}
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
                  onChange={(e) => handleUnitChange(e, index, "totalUnit")}
                  className="mt-1 p-1 border rounded w-full"
                >
                  <option value="ft">ft²</option>
                  <option value="cm">cm²</option>
                  <option value="m">m²</option>
                  <option value="in">in²</option>
                </select>
              </td>
              <td className="border p-2">
                <Button
                  onClick={() => handleDeleteRow(index)}
                  sx={{ color: "red" }}
                >
                  <DeleteIcon />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
        <strong>Total Sum: {totalSum.toFixed(2)} ft²</strong>

        <Button
          onClick={handleSave}
          variant="contained"
          component="label"
          color="success"
          sx={{
            color: "white",
            "&:hover": { backgroundColor: "#333" , color: "white" },
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
