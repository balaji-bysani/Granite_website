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
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/products" element={<ProductSelection />} />
        <Route path="/granite/customer-details" element={<CustomerDetails />} />
        <Route
          path="/granite/slab-measurements"
          element={<SlabMeasurements />}
        />
        <Route path="/granite/SheetsList" element={<SheetsList />} />
        <Route path="/granite/edit-sheet/:id" element={<EditSheet />} />
      </Routes>
    </div>
  );
}
