import { Routes, Route, Navigate } from 'react-router-dom';
import MemberContributions from './pages/Member/MemberContributions';
import ContributionDetails from './pages/Contributions/ContributionDetails';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Members from './pages/Members/Members';
import Contributions from './pages/Contributions/Contributions';
import Payments from './pages/Payments/Payments';
import Events from './pages/Events/Events';
import Caisse from './pages/Cash/Caisse';
import MemberDashboard from './pages/Member/MemberDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import MemberProfile from './pages/Member/MemberProfile';
import MemberPayments from './pages/Member/MemberPayments';
import Users from './pages/Users/Users';
function App() {
  return (
  <Routes>

  {/* =========================
      ROUTES PUBLIQUES
  ========================== */}

  <Route
    path="/login"
    element={<Login />}
  />


  {/* =========================
      ROUTES PROTÉGÉES
  ========================== */}

  <Route element={<ProtectedRoute />}>


    {/* =========================
        ROUTES ADMIN
    ========================== */}

    <Route
      element={
        <RoleProtectedRoute
          allowedRoles={['ADMIN']}
        />
      }
    >
      <Route element={<MainLayout />}>

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/members"
          element={<Members />}
        />

        <Route
          path="/contributions"
          element={<Contributions />}
        />

        <Route
          path="/contributions/:id"
          element={<ContributionDetails />}
        />

        <Route
          path="/payments"
          element={<Payments />}
        />

        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/cash"
          element={<Caisse />}
        />
        <Route path="/users" element={<Users />} />

      </Route>
    </Route>


    {/* =========================
        ROUTES MEMBER
    ========================== */}

    <Route
      element={
        <RoleProtectedRoute
          allowedRoles={['MEMBER']}
        />
      }
    >
      <Route element={<MainLayout />}>

        <Route
          path="/member/dashboard"
          element={<MemberDashboard />}
        />
        <Route
  path="/member/profile"
  element={<MemberProfile />}
/>
<Route
  path="/member/contributions"
  element={<MemberContributions />}
/>
<Route
  path="/member/payments"
  element={<MemberPayments />}
/>
      </Route>
    </Route>

  </Route>

</Routes>
  );
}

export default App;