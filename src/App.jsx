import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import AdminDashboard from './admin/AdminDashboard'


export default function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={
          <AdminDashboard />
        }
      />

      <Route
        path="/admin/*"
        element={
          <AdminDashboard />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  )
}
