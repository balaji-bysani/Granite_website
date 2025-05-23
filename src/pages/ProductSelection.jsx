import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

export default function ProductSelection() {
  const navigate = useNavigate();

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
          width: 500,
          height: 300,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: 3,
          borderRadius: 5,
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            align="center"
            fontFamily={"Times New Roman"}
            gutterBottom
          >
            Please select a product and get details:
          </Typography>
          <Box mt={2}>
            <Button
              onClick={() => navigate("/Granite_website/granite/customer-details")}
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "black",
                color: "white",
                "&:hover": { backgroundColor: "#333" },
                borderRadius: 2,
              }}
            >
              Granite
            </Button>
          </Box>
          <Box mt={2}>
            <Button
              onClick={() => alert("Block flow coming soon!")}
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "black",
                color: "white",
                "&:hover": { backgroundColor: "#333" },
                borderRadius: 2,
              }}
            >
              Block
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
