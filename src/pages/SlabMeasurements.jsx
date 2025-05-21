import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";


export default function SlabMeasurements() {
  const location = useLocation();
const customerId = location.state?.customerId;
  const [measurements, setMeasurements] = useState([
    { length: "", breadth: "", total: "", unit: "ft", totalUnit: "ft", blockNumber: "" },
  ]);
  const [totalSum, setTotalSum] = useState(0);
  const [unit, setUnit] = useState("ft");  // Store the unit for all rows
  const [totalUnit, setTotalUnit] = useState("ft");
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
      const { length, breadth} = measurement;
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
  }, [measurements,unit,totalUnit]);

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
        { length: "", breadth: "", total: "", unit: "ft", totalUnit: "ft", blockNumber: "" }

      ]);
    }
  }, [measurements]);

  // 🔥 SAVE to Firebase
  const handleSave = async () => {
    try {
      // Save slab data with the customer ID reference
      await addDoc(collection(db, "sheets"), {
        measurements: measurements.filter((m) => m.length && m.breadth),
        totalSum,
        createdAt: new Date(),
        customerId: customerId, // reference to customer
      });
  
      alert("Sheet saved!");
      navigate("/SheetsList"); // navigate to your SheetsList page
    } catch (error) {
      console.error("Error saving sheet:", error);
      alert("Failed to save. Please try again.");
    }
  };
  

  const handleCopyPreviousBlockNumber = (index) => {
    if (index === 0) return;
    const newMeasurements = [...measurements];
    newMeasurements[index].blockNumber = newMeasurements[index - 1].blockNumber;
    setMeasurements(newMeasurements);
  };
  
  const handleCopyPreviousRow = (index) => {
    if (index === 0) return; // Prevent copying for the first row
    const newMeasurements = [...measurements];
    const previousRow = newMeasurements[index - 1];
    newMeasurements.splice(index, 0, { ...previousRow }); // Insert a copy of the previous row at the current index
    setMeasurements(newMeasurements);
  };

  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Slab Measurements</h2>

      <TableContainer component={Paper} className="min-w-full table-auto">
        <Table>
        <TableHead>
          <TableRow>
          <TableCell className="border p-2">
                Length
                <select
                  onChange={(e) => setUnit(e.target.value)}
                  value={unit}
                  className="mt-1 p-1 border rounded w-full"
                >
                  <option value="ft">ft</option>
                  <option value="m">m</option>
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </TableCell>
              <TableCell className="border p-2">
                Breadth
                <select
                  onChange={(e) => setUnit(e.target.value)}
                  value={unit}
                  className="mt-1 p-1 border rounded w-full"
                >
                  <option value="ft">ft</option>
                  <option value="m">m</option>
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </TableCell>
            <TableCell className="border p-2">Block Number</TableCell>
            <TableCell className="border p-2">
                Total
                <select
                  onChange={(e) => setTotalUnit(e.target.value)}
                  value={totalUnit}
                  className="mt-1 p-1 border rounded w-full"
                >
                  <option value="ft">ft²</option>
                  <option value="m">m²</option>
                  <option value="cm">cm²</option>
                  <option value="in">in²</option>
                </select>
              </TableCell>
            <TableCell className="border p-2">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {measurements.map((measurement, index) => (
            <TableRow  key={index}>
              <TableCell className="border p-2">
                <input
                  type="number"
                  value={measurement.length}
                  onChange={(e) => handleChange(e, index, "length")}
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Length"
                />
                
              </TableCell>
              <TableCell className="border p-2">
                <input
                  type="number"
                  value={measurement.breadth}
                  onChange={(e) => handleChange(e, index, "breadth")}
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Breadth"
                />
                
              </TableCell>
              <TableCell className="border p-2">
  <input
    type="text"
    value={measurement.blockNumber}
    onChange={(e) => handleChange(e, index, "blockNumber")}
    className="w-full px-2 py-1 border rounded"
    placeholder="Block #"
  />
</TableCell>

              <TableCell className="border p-2">
                <input
                  type="text"
                  value={measurement.total}
                  disabled
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Total"
                />
               
              </TableCell>
              <div className="flex gap-2">
  <Button
    onClick={() => handleDeleteRow(index)}
    sx={{ color: "red", minWidth: 0 }}
  >
    <DeleteIcon />
  </Button>
  {index > 0 && (
  <Button
    onClick={() => handleCopyPreviousBlockNumber(index)}
    variant="outlined"
    size="small"
    sx={{ textTransform: "none", borderRadius: 2 }}
  >
    Copy Block
  </Button>
)}

{index > 0 && (
    <Button
      onClick={() => handleCopyPreviousRow(index)}
      variant="outlined"
      size="small"
      sx={{ textTransform: "none", borderRadius: 2 }}
    >
      Copy Row
    </Button>
  )}
</div>

            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>

      <div className="mt-4 flex justify-between items-center">
      <strong>Total Sum: {totalSum.toFixed(2)} {totalUnit}²</strong>
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
