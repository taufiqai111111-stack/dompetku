import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useStore } from './hooks/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transfer from './pages/Transfer';
import Investments from './pages/Investments';
import Assets from './pages/Assets';
import Transactions from './pages/Transactions';
import Receivables from './pages/Receivables';
import Login from './pages/Login';

const ProtectedRoute = () => {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="rekening" element={<Accounts />} />
            <Route path="transfer" element={<Transfer />} />
            <Route path="investasi" element={<Investments />} />
            <Route path="aset" element={<Assets />} />
            <Route path="transaksi" element={<Transactions />} />
            <Route path="piutang" element={<Receivables />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
