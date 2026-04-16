import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import Preview from "./pages/Preview";
import Login from "./pages/Login";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import ProtectedRoute from "./components/ProtectedRoute";
import Subscription from "./pages/Subscription";
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="builder/:resumeId" element={<ResumeBuilder />} />
          <Route
            path="builder/:resumeId/analysis"
            element={<ResumeAnalysis />}
          />
          <Route path="subscription" element={<Subscription />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route index element={<Dashboard />} />
        </Route>

        <Route
          path="view/:resumeId"
          element={
            <ProtectedRoute>
              <Preview />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
