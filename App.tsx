import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Institutions from './pages/Institutions';
import EvaluationPage from './pages/Evaluation';
import CompliancePage from './pages/Compliance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { UiProvider, useUi } from './contexts/UiContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useUi();
    return isAuthenticated ? <>{children}</> : <Login />;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/institutions" element={<ProtectedRoute><Institutions /></ProtectedRoute>} />
          <Route path="/evaluation" element={<ProtectedRoute><EvaluationPage /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/improvements" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <UiProvider>
        <Router>
          <Layout>
            <AppRoutes />
          </Layout>
        </Router>
    </UiProvider>
  );
};

export default App;