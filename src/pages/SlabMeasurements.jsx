import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Card
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function SlabMeasurements() {
  const location = useLocation();
const customerId = location.state?.customerId;
  const [measurements, setMeasurements] = useState([
    { blockNumber: "", length: "", breadth: "", total: "" },
  ]);
  const [totalSum, setTotalSum] = useState(0);
  const [unit, setUnit] = useState("ft");
  const [totalUnit, setTotalUnit] = useState("ft");
  const navigate = useNavigate();

  const convertToFeet = (value, unit) => {
    if (!value) return 0;
    switch (unit) {
      case "m": return value * 3.28084;
      case "in": return value / 12;
      case "cm": return value / 30.48;
      default: return value;
    }
  };

  const convertTotalUnit = (value, unit) => {
    switch (unit) {
      case "m": return value / 10.7639;
      case "cm": return value * 929.0304;
      case "in": return value * 144;
      default: return value;
    }
  };

  const calculateTotal = (length, breadth, unit) => {
    const l = convertToFeet(length, unit);
    const b = convertToFeet(breadth, unit);
    return l * b;
  };

  useEffect(() => {
    let sum = 0;
    const updated = measurements.map((m) => {
      const total = calculateTotal(m.length, m.breadth, unit);
      const converted = convertTotalUnit(total, totalUnit);
      sum += converted;
      return { ...m, total: converted.toFixed(2) };
    });
    setMeasurements(updated);
    setTotalSum(sum);
  }, [measurements.length, unit, totalUnit]);

  useEffect(() => {
    const last = measurements[measurements.length - 1];
    if (last.length !== "" && last.breadth !== "") {
      setMeasurements([...measurements, { blockNumber: "", length: "", breadth: "", total: "" }]);
    }
  }, [measurements]);

  const handleChange = (e, index, field) => {
    const newList = [...measurements];
    newList[index][field] = e.target.value;
    setMeasurements(newList);
  };

  const handleDeleteRow = (index) => {
    const list = [...measurements];
    list.splice(index, 1);
    setMeasurements(list);
  };

  const handleCopyPreviousBlock = () => {
    if (measurements.length < 2) return;
    const newList = [...measurements];
    for (let i = 1; i < newList.length; i++) {
      newList[i].blockNumber = newList[i - 1].blockNumber;
    }
    setMeasurements(newList);
  };

  const handleCopyPreviousRow = () => {
    if (measurements.length < 2) return;
    const previous = measurements[measurements.length - 2];
    setMeasurements([
      ...measurements.slice(0, -1),
      { ...previous },
      measurements[measurements.length - 1],
    ]);
  };

  const handleSave = async () => {
    try {
      // Save slab data with the customer ID reference
      await addDoc(collection(db, "sheets"), {
        measurements: measurements.filter(m => m.length && m.breadth),
        totalSum,
        createdAt: new Date(),
        customerId: customerId, // reference to customer
      });
  
      alert("Sheet saved!");
      navigate("/SheetsList");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save.");
    }
  };
  

  return (
    <Box sx={{ padding: 4, backgroundColor: "black", minHeight: "100vh" }}>
      <Card sx={{ padding: 4, backgroundColor: "white", borderRadius: 4, boxShadow: 6 }}>
        <Typography variant="h4" gutterBottom align="center" fontFamily="Times New Roman">
          Slab Measurements
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            select
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            sx={{ width: "50%" }}
            
          >
            {["ft", "m", "cm", "in"].map((u) => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Total Unit"
            value={totalUnit}
            onChange={(e) => setTotalUnit(e.target.value)}
            sx={{ width: "50%" }}
          >
            {["ft", "m", "cm", "in"].map((u) => (
              <MenuItem key={u} value={u}>{u}²</MenuItem>
            ))}
          </TextField>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Block #</TableCell>
                <TableCell>Length</TableCell>
                <TableCell>Breadth</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {measurements.map((m, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <TextField
                      value={m.blockNumber}
                      onChange={(e) => handleChange(e, i, "blockNumber")}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={m.length}
                      onChange={(e) => handleChange(e, i, "length")}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={m.breadth}
                      onChange={(e) => handleChange(e, i, "breadth")}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={m.total}
                      size="small"
                      disabled
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteRow(i)} sx={{ color: "red" }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button onClick={handleCopyPreviousBlock} variant="filled" sx={{ backgroundColor: "black", color: "white", borderRadius: 2 }}>
            Copy Previous Block
          </Button>
          <Button onClick={handleCopyPreviousRow} variant="filled" sx={{ backgroundColor: "black", color: "white", borderRadius: 2 }}>
            Copy Previous Row
          </Button>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
          <Typography variant="h6">
            Total Sum: {totalSum.toFixed(2)} {totalUnit}²
          </Typography>
          <Button onClick={handleSave} variant="contained" color="success" sx={{ borderRadius: 2, width: "1440%" }}>
            Save
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
