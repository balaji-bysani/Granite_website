import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ProductSelection from './pages/ProductSelection';
import CustomerDetails from './pages/CustomerDetails';
import SlabMeasurements from './pages/SlabMeasurements';
import SheetsList from './pages/SheetsList';

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/products' element={<ProductSelection />} />
      <Route path='/granite/customer-details' element={<CustomerDetails />} />
      <Route path='/granite/slab-measurements' element={<SlabMeasurements />} />
      <Route path="/SheetsList" element={<SheetsList />} />
    </Routes>
  );
}