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
    const customer = customers[customerId] || {};

    const docPDF = new jsPDF();
    const pageWidth = docPDF.internal.pageSize.getWidth();

    // Title
    docPDF.setFontSize(20);
    docPDF.setFont("helvetica", "bold");
    docPDF.text("Jaya Balaji Industries", pageWidth / 2, 20, { align: "center" });

    // Subtitle
    docPDF.setFontSize(14);
    docPDF.setFont("helvetica", "normal");
    docPDF.text("Measurement Sheet", pageWidth / 2, 28, { align: "center" });

    // Date (right-aligned)
    docPDF.setFontSize(10);
    const formattedDate = createdAt?.toDate
      ? createdAt.toDate().toLocaleDateString()
      : "N/A";
    docPDF.text(`Date: ${formattedDate}`, pageWidth - 14, 28, { align: "right" });

    // Customer Info
    docPDF.setFontSize(12);
    docPDF.text(`Customer: ${customer.partyName || "N/A"}`, 14, 38);
    docPDF.text(`Granite Name: ${customer.graniteName || "N/A"}`, 14, 44);

    // Table
    autoTable(docPDF, {
      startY: 52,
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
        m.slabNumber || "-",
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
        `${label} Total: ${catTotal.toFixed(2)} sq${firstMeasurement.totalUnit || ""}`,
        14,
        y
      );
      y += 8;
    });

    docPDF.save(`${formattedDate} - ${customer.partyName || "N/A"}.pdf`);

    // Export PDF for export customers with adjusted measurements
    if ((customer.typeOfSale || "").toLowerCase() === "export") {
      const adjustedMeasurements = measurements.map((m) => {
        const lengthInches = convertToInches(m.length, m.unit);
        const breadthInches = convertToInches(m.breadth, m.unit);

        const adjLength = Math.max(lengthInches - 3, 0);
        const adjBreadth = Math.max(breadthInches - 2, 0);

        const newLength = convertFromInches(adjLength, m.unit);
        const newBreadth = convertFromInches(adjBreadth, m.unit);

        const newTotal = (adjLength / 12) * (adjBreadth / 12);

        return {
          ...m,
          originalLength: m.length,
          originalBreadth: m.breadth,
          originalTotal: m.total,
          adjustedLength: newLength.toFixed(2),
          adjustedBreadth: newBreadth.toFixed(2),
          adjustedTotal: newTotal.toFixed(2),
        };
      });

      const adjustedTotalSum = adjustedMeasurements.reduce(
        (acc, curr) => acc + parseFloat(curr.adjustedTotal || 0),
        0
      );

      const docPDF2 = new jsPDF();
      const pageWidth2 = docPDF2.internal.pageSize.getWidth();

      docPDF2.setFontSize(20);
      docPDF2.setFont("helvetica", "bold");
      docPDF2.text("Jaya Balaji Industries", pageWidth2 / 2, 20, { align: "center" });

      docPDF2.setFontSize(14);
      docPDF2.setFont("helvetica", "normal");
      docPDF2.text("Adjusted Measurement Sheet", pageWidth2 / 2, 28, { align: "center" });

      docPDF2.setFontSize(10);
      docPDF2.text(`Date: ${formattedDate}`, pageWidth2 - 14, 28, { align: "right" });

      docPDF2.setFontSize(12);
      docPDF2.text(`Customer: ${customer.partyName || "N/A"}`, 14, 38);
      docPDF2.text(`Granite Name: ${customer.graniteName || "N/A"}`, 14, 44);

      autoTable(docPDF2, {
        startY: 52,
        head: [
          [
            "Slab Number",
            `Net Length (${measurements[0]?.unit || ""})`,
            `Net Breadth (${measurements[0]?.unit || ""})`,
            `Net msmt (sq${measurements[0]?.totalUnit || ""})`,
            `Gross Length (${measurements[0]?.unit || ""})`,
            `Gross Breadth (${measurements[0]?.unit || ""})`,
            `Gross msmt (sq${measurements[0]?.totalUnit || ""})`,
          ],
        ],
        body: adjustedMeasurements.map((m) => [
          m.slabNumber || "-",
          m.originalLength,
          m.originalBreadth,
          
          m.originalTotal,
          m.adjustedLength,
          m.adjustedBreadth,
          m.adjustedTotal,
        ]),
      });

      let y2 = docPDF2.lastAutoTable.finalY + 10;
      docPDF2.text(
      `Net Total Sum: ${totalSum}  sq${measurements[0]?.totalUnit || ""}`,
      14,
      y2
    );
      docPDF2.text(
        `Gross Total Sum: ${adjustedTotalSum.toFixed(2)} sq${measurements[0]?.totalUnit || ""}`,
        14,
        y2+6
      );

      docPDF2.save(`Detailed ${formattedDate} - ${customer.partyName || "N/A"}.pdf`);
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
        return inches;
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
          gap: 2,
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
