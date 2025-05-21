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
    navigate(`/granite/edit-sheet/${id}`);
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
      const { measurements = [], totalSum = 0, customerId, createdAt } = sheetData;

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
          createdAt?.toDate
            ? createdAt.toDate().toLocaleDateString()
            : "N/A"
        }`,
        14,
        42
      );

      // Table of measurements
      autoTable(docPDF, {
        startY: 50,
        head: [["Length", "Breadth", "Unit", "Total", "Total Unit"]],
        body: measurements.map((m) => [
          `${m.length} ${m.unit || ""}`,
          `${m.breadth} ${m.unit || ""}`,
          m.unit || "",
          `${m.total} ${m.totalUnit || ""}`,
          m.totalUnit || "",
        ]),
      });

      docPDF.text(`Total Sum: ${totalSum}`, 14, docPDF.lastAutoTable.finalY + 10);

      docPDF.save("granite-sheet.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF.");
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom>
        Granite Sheets List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Customer</TableCell>
              <TableCell sx={{ color: "white" }}>Product</TableCell>
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
                  <TableCell>{dateStr}</TableCell>
                  <TableCell>{sheet.totalSum || "0"}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleEdit(sheet.id)}>
                      Edit
                    </Button>
                    <Button size="small" onClick={() => handleShare(sheet.id)}>
                      Share
                    </Button>
                    <Button size="small" onClick={() => handleViewPDF(sheet.id)}>
                      View PDF
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(sheet.id)}
                    >
                      Delete
                    </Button>
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
    </Box>  
  );
}
