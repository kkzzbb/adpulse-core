import { Route, Routes } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { CampaignDetailPage } from "./pages/CampaignDetailPage";
import { CampaignListPage } from "./pages/CampaignListPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RequireAuth } from "./components/auth/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

export default function App() {
 return (
  <Routes>
    <Route
      path="/login"
      element={<LoginPage />}
    />
    <Route
      path="/register"
      element={<RegisterPage />}
    />
    
    <Route
      element={<RequireAuth />}
    >
      <Route
          element={
            <AppLayout />
          }
        >
      <Route
        path="/"
        element={<CampaignListPage />}
      />
      
      <Route
        path="campaigns/:campaignId"
        element={<CampaignDetailPage />}
      />
    </Route>
  
    </Route>
    <Route
      path="*"
      element={<NotFoundPage />}
    />
  </Routes>
  );
}