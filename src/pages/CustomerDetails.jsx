import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function CustomerDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    graniteName: "",
    partyName: "",
    date: "",
    image: null,
    vehicleNumber: "",
    typeOfSale: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleNext = async () => {
    try {
      const customerRef = await addDoc(collection(db, "Customers"), {
        graniteName: formData.graniteName,
        partyName: formData.partyName,
        date: formData.date,
        vehicleNumber: formData.vehicleNumber,
        typeOfSale: formData.typeOfSale,
        image: null, // Add image upload logic later if needed
        createdAt: serverTimestamp(),
      });

      alert("Customer saved!");
      navigate("/Granite_website/granite/slab-measurements", {
        state: {
          customerId: customerRef.id,
        },
      });
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("Failed to save customer. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          width: 400,
          minHeight: 480,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: 3,
          py: 2,
          borderRadius: 5,
          boxShadow: 5,
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            align="center"
            fontFamily={"Times New Roman"}
            gutterBottom
          >
            Please enter the customer details:
          </Typography>

          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              fullWidth
              name="graniteName"
              label="Granite Name"
              value={formData.graniteName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              name="partyName"
              label="Party Name"
              value={formData.partyName}
              onChange={handleChange}
              required
            />
            <TextField
              select
              fullWidth
              name="typeOfSale"
              label="Type of Sale"
              value={formData.typeOfSale}
              onChange={handleChange}
              required
            >
              <MenuItem value="">Select Type</MenuItem>
              <MenuItem value="Local">Local</MenuItem>
              <MenuItem value="Export">Export</MenuItem>
              <MenuItem value="Outstation">Outstation</MenuItem>
            </TextField>

            <TextField
              fullWidth
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Upload Image
              </Typography>
              <Button
                variant="contained"
                component="label"
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  "&:hover": { backgroundColor: "#333" },
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Choose File
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  hidden
                  onChange={handleChange}
                />
              </Button>
              {formData.image && (
                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                  Selected: {formData.image.name}
                </Typography>
              )}
            </Box>
            <TextField
              fullWidth
              name="vehicleNumber"
              label="Truck/Vehicle Number (optional)"
              value={formData.vehicleNumber}
              onChange={handleChange}
            />

            <Button
              onClick={handleNext}
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "black",
                color: "white",
                "&:hover": { backgroundColor: "#333" },
                borderRadius: 2,
              }}
            >
              Next
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
