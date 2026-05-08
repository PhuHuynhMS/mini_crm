import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CustomerList from './pages/Customers/CustomerList.jsx';
import OrderList from './pages/Orders/OrderList.jsx';

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/orders" element={<OrderList />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;
