import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import {
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
  Card,
} from "@mui/material";

export default function SlabMeasurements() {
  const location = useLocation();
  const customerId = location.state?.customerId;
  const [measurements, setMeasurements] = useState([
    { length: "", breadth: "", total: "", unit: "ft", totalUnit: "ft", blockNumber: "", category: "" }

  ]);
  const [totalSum, setTotalSum] = useState(0);
  const [unit, setUnit] = useState("ft"); // Store the unit for all rows
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
      const { length, breadth } = measurement;
      const total = calculateTotal(length, breadth, unit);
      const convertedTotal = convertTotalUnit(total, totalUnit);
      return {
        ...measurement,
        total: convertedTotal.toFixed(2),
        unit: unit,
        totalUnit: totalUnit,
      };
    });

    newMeasurements.forEach((measurement) => {
      const total = parseFloat(measurement.total);
      sum += total;
    });

    setTotalSum(sum);
    setMeasurements(newMeasurements);
  }, [measurements, unit, totalUnit]);

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

  const handleCopyPreviousRow = () => {
    if (measurements.length < 2) return;
    const previous = measurements[measurements.length - 2];
    setMeasurements([
      ...measurements.slice(0, -1),
      { ...previous },
      measurements[measurements.length - 1],
    ]);
  };

  // Auto add new row
  useEffect(() => {
    const lastRow = measurements[measurements.length - 1];
    if (lastRow.length !== "" && lastRow.breadth !== "") {
      setMeasurements([
        ...measurements,
        {
          length: "",
          breadth: "",
          total: "",
          unit: "ft",
          totalUnit: "ft",
          blockNumber: "",
        },
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
      navigate("/granite/SheetsList"); // navigate to your SheetsList page
    } catch (error) {
      console.error("Error saving sheet:", error);
      alert("Failed to save. Please try again.");
    }
  };

  const handleCopyPreviousBlock = () => {
    if (measurements.length < 2) return;
    const newList = [...measurements];
    for (let i = 1; i < newList.length; i++) {
      newList[i].blockNumber = newList[i - 1].blockNumber;
    }
    setMeasurements(newList);
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "black", minHeight: "100vh" }}>
      <Card
        sx={{
          padding: 4,
          backgroundColor: "white",
          borderRadius: 4,
          boxShadow: 6,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          fontFamily="Times New Roman"
        >
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
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
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
              <MenuItem key={u} value={u}>
                {u}²
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "black" }}>
                <TableCell sx={{ color: "white" }}>Block #</TableCell>
                <TableCell sx={{ color: "white" }}>Length</TableCell>
                <TableCell sx={{ color: "white" }}>Breadth</TableCell>
                <TableCell sx={{ color: "white" }}>Category</TableCell>
                <TableCell sx={{ color: "white" }}>Total</TableCell>
                <TableCell sx={{ color: "white" }}>Actions</TableCell>
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
                    <Select
                      value={m.category || ""}
                      onChange={(e) => handleChange(e, i, "category")}
                      size="small"
                    >
                      <MenuItem value={"F"}>Fresh</MenuItem>
                      <MenuItem value={"LD"}>Light Defect</MenuItem>
                      <MenuItem value={"D"}>Defect</MenuItem>
                      <MenuItem value={"S"}>Small</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <TextField value={m.total} size="small" disabled />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleDeleteRow(i)}
                      sx={{ color: "red" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            onClick={handleCopyPreviousBlock}
            variant="filled"
            sx={{ backgroundColor: "black", color: "white", borderRadius: 2 }}
          >
            Copy Previous Block
          </Button>
          <Button
            onClick={handleCopyPreviousRow}
            variant="filled"
            sx={{ backgroundColor: "black", color: "white", borderRadius: 2 }}
          >
            Copy Previous Row
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
          }}
        >
          <Typography variant="h6">
            Total Sum: {totalSum.toFixed(2)} {totalUnit}²
          </Typography>
          <Button
            onClick={handleSave}
            variant="contained"
            color="success"
            sx={{ borderRadius: 2, width: "14%" }}
          >
            Save
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
