import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

/* Layouts */
import MainLayout from "./layouts/MainLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";

/* Pages */
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AccountsPage from "./pages/AccountsPage";
import GiftsPage from "./pages/GiftsPage";
import RewardsPage from "./pages/RewardsPage";
import WasteStationPage from "./pages/WasteStationPage";
import WasteStationConfigPage from "./pages/WasteStationConfigPage";
import ContentManagementPage from "./pages/ContentManagementPage";
import ContentTopicConfigPage from "./pages/ContentTopicConfigPage";
import EventReviewPage from "./pages/EventReviewPage";
import EventPromotePage from "./pages/EventPromotePage";
import HuntPointsPage from "./pages/HuntPointsPage";
import ArticlesPage from "./pages/ArticlesPage";
import QuizzesPage from "./pages/QuizzesPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import NotFound from "./pages/NotFound";
import CreateQuizPage from "./pages/CreateQuizPage";
import ProfilePage from "./pages/ProfilePage";
import EditQuizPage from "./pages/EditQuizPage";
import QuizDetailPage from "./pages/QuizDetailPage";
import VideoPage from "./pages/VideoPage";
/* Guards */
import RequireChangePassword from "./guards/RequireChangePassword";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />

      <BrowserRouter>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<LoginPage />} />

          {/* Route đặc biệt: chỉ hiển thị khi user bị yêu cầu đổi mật khẩu */}
          <Route
            path="/change-password"
            element={
              <RequireChangePassword>
                <ChangePasswordPage />
              </RequireChangePassword>
            }
          />

          {/* ================= PROTECTED ROUTES (ĐÃ ĐĂNG NHẬP) ================= */}
          <Route element={<ProtectedLayout />}>
            {/* Các route bên trong có MainLayout (sidebar + header) */}
            <Route element={<MainLayout />}>
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/gifts" element={<GiftsPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/waste_stations" element={<WasteStationPage />} />
              <Route
                path="/waste_stations/config"
                element={<WasteStationConfigPage />}
              />
              <Route path="/content/management" element={<ContentManagementPage />} />
              <Route path="/content/config" element={<ContentTopicConfigPage />} />
              <Route path="/content/video" element={<VideoPage/>}/>
              <Route path="/events/review" element={<EventReviewPage />} />
              <Route path="/events/promote" element={<EventPromotePage />} />
              <Route path="/hunt_points" element={<HuntPointsPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/quizzes/create" element={<CreateQuizPage/>}/>
              <Route path="/quizzes/:id/edit" element={<EditQuizPage />} />
              <Route path="/quizzes/:id" element={<QuizDetailPage />} />

              
              
              
            </Route>

           
          </Route>

          {/* ================= 404 NOT FOUND ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;