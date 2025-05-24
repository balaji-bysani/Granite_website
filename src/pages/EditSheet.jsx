import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  IconButton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Select, { SelectChangeEvent } from "@mui/material/Select";

const unitOptions = ["ft", "m", "in"];

export default function EditSheet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const loadSheet = async () => {
      try {
        const sheetRef = doc(db, "sheets", id);
        const sheetSnap = await getDoc(sheetRef);
        if (sheetSnap.exists()) {
          const data = sheetSnap.data();
          setMeasurements(data.measurements || []);
          setCategory(data.category || "");
        } else {
          alert("Sheet not found.");
          navigate("/Granite_website/granite/SheetsList");
        }
      } catch (error) {
        console.error("Failed to fetch sheet:", error);
        alert("Error loading sheet.");
      } finally {
        setLoading(false);
      }
    };

    loadSheet();
  }, [id, navigate]);

  const unitToMeters = {
    ft: 0.3048,
    m: 1,
    in: 0.0254,
  };
  
  const handleChange = (index, field, value) => {
    setMeasurements((prev) => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };
  
      if (["length", "breadth", "unit", "totalUnit"].includes(field)) {
        // Parse length and breadth
        const lengthVal = parseFloat(field === "length" ? value : row.length);
        const breadthVal = parseFloat(field === "breadth" ? value : row.breadth);
  
        // Units for length/breadth and total
        const lengthBreadthUnit = field === "unit" ? value : row.unit;
        const totalUnit = field === "totalUnit" ? value : row.totalUnit;
  
        if (!isNaN(lengthVal) && !isNaN(breadthVal)) {
          // Convert length & breadth to meters
          const lengthInMeters = lengthVal * unitToMeters[lengthBreadthUnit];
          const breadthInMeters = breadthVal * unitToMeters[lengthBreadthUnit];
  
          // Calculate area in square meters
          const areaInMetersSquared = lengthInMeters * breadthInMeters;
  
          // Convert area from m² to desired total unit squared
          const conversionFactor = unitToMeters[totalUnit];
          const areaInTotalUnit = areaInMetersSquared / (conversionFactor * conversionFactor);
  
          row.total = areaInTotalUnit.toFixed(2);
        } else {
          row.total = "";
        }
      }
  
      updated[index] = row;
      return updated;
    });
  };
  
  

const addRow = () => {
  setMeasurements((prev) => {
    // Get the max existing slabNumber (assuming numbers)
    const existingNumbers = prev.map(row => parseInt(row.slabNumber)).filter(n => !isNaN(n));
    const nextSlabNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    return [
      ...prev,
      {
        slabNumber: nextSlabNumber.toString(),
        blockNumber:"",
        length: "",
        breadth: "",
        unit: "ft",
        total: "",
        totalUnit: "ft",
        category: "F",
      }
    ];
  });
};


  

  const deleteRow = (index) => {
    setMeasurements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const totalSum = measurements.reduce(
      (sum, row) => sum + parseFloat(row.total || 0),
      0
    );

    try {
      await updateDoc(doc(db, "sheets", id), {
        measurements,
        totalSum,
        category
      });

      alert("Sheet updated successfully!");
      navigate("/Granite_website/granite/SheetsList");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to save sheet.");
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 4, backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography variant="h5" gutterBottom sx={{ color: "#333" }}>
        Edit Sheet
      </Typography>

      {measurements.map((row, index) => (
        <Paper
          key={index}
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            backgroundColor: "#fff",
          }}
        >
     <TextField
  label="Slab Number"
  value={row.slabNumber || ""}
  onChange={(e) => handleChange(index, "slabNumber", e.target.value)}
  size="small"
/>

<TextField
  label="Block Number"
  type="text"
  value={row.blockNumber || ""}
  onChange={(e) => handleChange(index, "blockNumber", e.target.value)}
  size="small"
  sx={{ width: 140 }}
/>



     <Select
  select
  label="Category"
  value={row.category || ""}
  onChange={(e) => handleChange(index, "category", e.target.value)}
  size="small"
>
  <MenuItem value="F">Fresh</MenuItem>
  <MenuItem value="LD">Light Defect</MenuItem>
  <MenuItem value="D">Defect</MenuItem>
  <MenuItem value="S">Small</MenuItem>
</Select>

          <TextField
            label="Length"
            type="number"
            value={row.length}
            onChange={(e) => handleChange(index, "length", e.target.value)}
            size="small"
          />
          <TextField
            label="Breadth"
            type="number"
            value={row.breadth}
            onChange={(e) => handleChange(index, "breadth", e.target.value)}
            size="small"
          />
          <TextField
            select
            label="Unit"
            value={row.unit}
            onChange={(e) => handleChange(index, "unit", e.target.value)}
            size="small"
          >
            {unitOptions.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Total"
            value={row.total}
            InputProps={{ readOnly: true }}
            size="small"
          />
          <TextField
            select
            label="Total Unit"
            value={row.totalUnit}
            onChange={(e) => handleChange(index, "totalUnit", e.target.value)}
            size="small"
          >
            {unitOptions.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </TextField>
          <IconButton onClick={() => deleteRow(index)} color="error">
            <DeleteIcon />
          </IconButton>
        </Paper>
      ))}

      <Button variant="outlined" onClick={addRow} sx={{ mb: 3 }}>
        Add Row
      </Button>

      <Box>
        <Button
          variant="contained"
          sx={{ mr: 2 }}
          onClick={handleSave}
          color="primary"
        >
          Save
        </Button>
        <Button variant="text" onClick={() => navigate("/Granite_website/granite/SheetsList")}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
