import { Route, Routes } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { CampaignDetailPage } from "./pages/CampaignDetailPage";
import { CampaignListPage } from "./pages/CampaignListPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
 return (
  <Routes>
    <Route
      element={<AppLayout />}>
        <Route
          index element={<CampaignListPage />}
        />
        <Route
          path="campaigns/:campaignId"
          element={<CampaignDetailPage />}
        />
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Route>
   </Routes>
  );
}

export default App;