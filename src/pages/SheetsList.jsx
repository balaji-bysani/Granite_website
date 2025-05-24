import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Card } from "@mui/material";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SheetsList() {
  const [sheets, setSheets] = useState([]);
  const [customers, setCustomers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch customers once and map by id for easy lookup
      const customersSnapshot = await getDocs(collection(db, "Customers"));
      const custMap = {};
      customersSnapshot.forEach((doc) => {
        custMap[doc.id] = doc.data();
      });
      setCustomers(custMap);

      // Fetch sheets
      const sheetsSnapshot = await getDocs(collection(db, "sheets"));
      const sheetsData = [];
      sheetsSnapshot.forEach((doc) => {
        sheetsData.push({ id: doc.id, ...doc.data() });
      });
      setSheets(sheetsData);
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sheet?")) {
      await deleteDoc(doc(db, "sheets", id));
      setSheets((prev) => prev.filter((sheet) => sheet.id !== id));
      alert("Sheet deleted.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/Granite_website/granite/edit-sheet/${id}`);
  };

  const handleShare = (id) => {
    const shareUrl = `${window.location.origin}/granite/view-sheet/${id}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Granite Sheet",
          text: "Check out this granite sheet:",
          url: shareUrl,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link copied to clipboard!");
      });
    }
  };

  const handleViewPDF = async (sheetId) => {
    try {
      const sheetRef = doc(db, "sheets", sheetId);
      const sheetSnap = await getDoc(sheetRef);

      if (!sheetSnap.exists()) {
        alert("Sheet not found.");
        return;
      }

      const sheetData = sheetSnap.data();
      const {
        measurements = [],
        totalSum = 0,
        customerId,
        createdAt,
      } = sheetData;
      const CATEGORY_MAP = {
        F: "F",
        LD: "LD",
        D: "D",
        S: "S",
      };

      const categoryTotals = {};
      measurements.forEach(({ category, total }) => {
        const safeCategory = category || "Unknown";
        const numericTotal = parseFloat(total) || 0;
        if (!categoryTotals[safeCategory]) categoryTotals[safeCategory] = 0;
        categoryTotals[safeCategory] += numericTotal;
      });

      const firstMeasurement = measurements[0] || {};

      // Fetch customer details if available
      const customer = customers[customerId] || {};

      const docPDF = new jsPDF();
      docPDF.setFontSize(18);
      docPDF.text("Granite Sheet Summary", 14, 20);

      // Customer and sheet info
      docPDF.setFontSize(12);
      docPDF.text(`Customer: ${customer.partyName || "N/A"}`, 14, 30);
      docPDF.text(`Granite Name: ${customer.graniteName || "N/A"}`, 14, 36);
      docPDF.text(
        `Date: ${
          createdAt?.toDate ? createdAt.toDate().toLocaleDateString() : "N/A"
        }`,
        14,
        42
      );

      // Table of measurements
      autoTable(docPDF, {
        startY: 50,
        head: [
          [
            "Slab Number",
            "Block Number",
            `Length (${measurements[0]?.unit || ""})`,
            `Breadth (${measurements[0]?.unit || ""})`,
            "Category",
            `Total (sq${measurements[0]?.totalUnit || ""})`,
          ],
        ],
        body: measurements.map((m) => [
          m.slabNumber|| "-",
          m.blockNumber,
          m.length,
          m.breadth,
          CATEGORY_MAP[m.category] || "-",
          m.total,
        ]),
      });

      let y = docPDF.lastAutoTable.finalY + 10;

      docPDF.text(
        `Total Sum: ${totalSum}  sq${measurements[0]?.totalUnit || ""}`,
        14,
        y
      );
      y += 8;
      Object.entries(CATEGORY_MAP).forEach(([key, label]) => {
        const catTotal = Number(categoryTotals[key]) || 0;

        docPDF.text(
          `${label} Total: ${catTotal.toFixed(2)} sq${
            firstMeasurement.totalUnit || ""
          }`,
          14,
          y
        );
        y += 8;
      });

      docPDF.save("granite-sheet.pdf");
      if ((customer.typeOfSale || "").toLowerCase() === "export") {
        const adjustedMeasurements = measurements.map((m) => {
          const lengthInches = convertToInches(m.length, m.unit);
          const breadthInches = convertToInches(m.breadth, m.unit);
      
          const adjLength = Math.max(lengthInches - 3, 0);
          const adjBreadth = Math.max(breadthInches - 2, 0);
      
          const newLength = convertFromInches(adjLength, m.unit);
          const newBreadth = convertFromInches(adjBreadth, m.unit);
      
          // Total in sq.ft (length and breadth in inches /12 to get feet)
          const newTotal = (adjLength / 12) * (adjBreadth / 12);
      
          return {
            ...m,
            length: newLength.toFixed(2),
            breadth: newBreadth.toFixed(2),
            total: newTotal.toFixed(2),
          };
        });
      
        // Calculate adjusted total sum
        const adjustedTotalSum = adjustedMeasurements.reduce(
          (acc, curr) => acc + parseFloat(curr.total || 0),
          0
        );
      
        const docPDF2 = new jsPDF();
        docPDF2.setFontSize(18);
        docPDF2.text("Adjusted Granite Sheet for Export", 14, 20);
      
        docPDF2.setFontSize(12);
        docPDF2.text(`Customer: ${customer.partyName || "N/A"}`, 14, 30);
        docPDF2.text(`Granite Name: ${customer.graniteName || "N/A"}`, 14, 36);
        docPDF2.text(
          `Date: ${
            createdAt?.toDate ? createdAt.toDate().toLocaleDateString() : "N/A"
          }`,
          14,
          42
        );
      
        autoTable(docPDF2, {
          startY: 50,
          head: [
            [
              
              `Length (${measurements[0]?.unit || ""})`,
              `Breadth (${measurements[0]?.unit || ""})`,
              "Category",
              `Total (sq${measurements[0]?.totalUnit || ""})`,
            ],
          ],
          body: adjustedMeasurements.map((m) => [
           
            m.length,
            m.breadth,
            CATEGORY_MAP[m.category] || "-",
            m.total,
          ]),
        });
      
        // Add adjusted total sum below the table
        let y = docPDF2.lastAutoTable.finalY + 10;
        docPDF2.text(
          `Adjusted Total Sum: ${adjustedTotalSum.toFixed(2)} sq${
            measurements[0]?.totalUnit || ""
          }`,
          14,
          y
        );
      
        docPDF2.save("adjusted-export-granite-sheet.pdf");
      }
      
      
      
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF.");
    }
  };

  const convertToInches = (value, unit) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    switch (unit.toLowerCase()) {
      case "ft":
        return num * 12;
      case "m":
        return num * 39.3701;
      case "in":
        return num;
      default:
        return num;
    }
  };
  
  const convertFromInches = (inches, unit) => {
    switch (unit.toLowerCase()) {
      case "ft":
        return inches / 12;
      case "m":
        return inches / 39.3701;
      case "in":
        return inches
      default:
        return inches;
    }
  };
  
  
  return (
    <Box sx={{ p: 4, backgroundColor: "black", minHeight: "100vh" }}>
      <Card
        sx={{
          padding: 4,
          backgroundColor: "white",
          borderRadius: 4,
          boxShadow: 6,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          fontFamily="Times New Roman"
        >
          Granite Sheets List
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "black" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Customer</TableCell>
                <TableCell sx={{ color: "white" }}>Product</TableCell>
                <TableCell sx={{ color: "white" }}>Type of Sale</TableCell>
                <TableCell sx={{ color: "white" }}>Date</TableCell>
                <TableCell sx={{ color: "white" }}>Total</TableCell>
                <TableCell sx={{ color: "white" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sheets.map((sheet) => {
                const customer = customers[sheet.customerId] || {};
                const dateStr = sheet.createdAt?.toDate
                  ? sheet.createdAt.toDate().toLocaleDateString()
                  : "N/A";

                return (
                  <TableRow key={sheet.id}>
                    <TableCell>{customer.partyName || "N/A"}</TableCell>
                    <TableCell>{customer.graniteName || "N/A"}</TableCell>
                    <TableCell>{customer.typeOfSale || "N/A"}</TableCell>
                    <TableCell>{customer.date || dateStr}</TableCell>
                    <TableCell>{sheet.totalSum || "0"}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEdit(sheet.id)}
                        sx={{ color: "black" }}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => handleShare(sheet.id)}
                        sx={{ color: "black" }}
                      >
                        <ShareIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => handleViewPDF(sheet.id)}
                        sx={{ color: "black" }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(sheet.id)}
                        sx={{ color: "red" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sheets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No sheets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <IconButton
          onClick={() => navigate("/Granite_website/granite/customer-details")}
          sx={{
            backgroundColor: "black",
            color: "white",
            marginTop: "auto",
            width: "3%",
            height: "3%",
            marginLeft: "auto",
          }}
        >
          <AddIcon />
        </IconButton>
      </Card>
    </Box>
  );
}
