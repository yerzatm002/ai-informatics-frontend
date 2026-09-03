import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Course from './pages/Course'
import TestPage from './pages/TestPage'
import Survey from './pages/Survey'
import Result from './pages/Result'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="course/:topicId" element={<Course />} />
        <Route path="test/:type" element={<TestPage />} />
        <Route path="survey" element={<Survey />} />
        <Route path="result" element={<Result />} />
      </Route>

      <Route element={<ProtectedRoute adminOnly><AppShell admin /></ProtectedRoute>}>
        <Route path="admin" element={<AdminDashboard />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
