import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function SheetsList() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sheetsSnapshot = await getDocs(collection(db, "sheets"));
        const sheetsData = [];

        for (const sheetDoc of sheetsSnapshot.docs) {
          const sheet = sheetDoc.data();
          const customerId = sheet.customerId;

          let customerData = {};
          if (customerId) {
            const customerDoc = await getDoc(doc(db, "Customers", customerId));
            if (customerDoc.exists()) {
              customerData = customerDoc.data();
            }
          }

          sheetsData.push({
            id: sheetDoc.id,
            customerName: customerData.partyName || "Unknown",
            graniteName: customerData.graniteName || "Unknown",
            date: customerData.date || "N/A",
            total: sheet.totalSum || 0,
          });
        }

        setSheets(sheetsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sheets:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sheet?")) {
      await deleteDoc(doc(db, "sheets", id));
      setSheets(sheets.filter((sheet) => sheet.id !== id));
    }
  };

  const handleEdit = (id) => navigate(`/granite/edit-sheet/${id}`);
  const handleShare = (id) => alert(`Share functionality for sheet ID: ${id}`);
  const handleViewPDF = (id) => alert(`PDF view for sheet ID: ${id}`);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Customer</strong></TableCell>
            <TableCell><strong>Product</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Total</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sheets.map((sheet) => (
            <TableRow key={sheet.id}>
              <TableCell>{sheet.customerName}</TableCell>
              <TableCell>{sheet.graniteName}</TableCell>
              <TableCell>{sheet.date}</TableCell>
              <TableCell>{sheet.total}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => handleEdit(sheet.id)}>Edit</Button>
                <Button size="small" onClick={() => handleShare(sheet.id)}>Share</Button>
                <Button size="small" onClick={() => handleViewPDF(sheet.id)}>PDF</Button>
                <Button size="small" color="error" onClick={() => handleDelete(sheet.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
