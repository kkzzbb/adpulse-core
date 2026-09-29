import { Route, Routes } from "react-router";
import { AppLayout } from "./components/layout/AppLayout.tsx";
import { CampaignDetailPage } from "./pages/CampaignDetailPage.tsx";
import { CampaignListPage } from "./pages/CampaignListPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";

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