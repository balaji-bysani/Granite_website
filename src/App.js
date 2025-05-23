import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProductSelection from "./pages/ProductSelection";
import CustomerDetails from "./pages/CustomerDetails";
import SlabMeasurements from "./pages/SlabMeasurements";
import SheetsList from "./pages/SheetsList";
import EditSheet from "./pages/EditSheet";
import Header from "./pages/Header";
export default function App() {
  return (
    <div display="flex" flexDirection="column" gap="3" height="100vh">
      <Header />

      <Routes>
        <Route path="/Granite_website" element={<Login />} />
        <Route path="/Granite_website/products" element={<ProductSelection />} />
        <Route path="/Granite_website/granite/customer-details" element={<CustomerDetails />} />
        <Route
          path="/Granite_website/granite/slab-measurements"
          element={<SlabMeasurements />}
        />
        <Route path="/Granite_website/granite/SheetsList" element={<SheetsList />} />
        <Route path="/Granite_website/granite/edit-sheet/:id" element={<EditSheet />} />
      </Routes>
    </div>
  );
}
