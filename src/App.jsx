import MainPage from "./components/MainPage";
import RightSideBar from "./components/RightSideBar";
import "./components/styles/App.css";
import DreamCalendar from "./components/Calendar";

import AuthPage from "./components/Authpage";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

function App() {
  const location = useLocation();

  const isAuthPage = location.pathname === "/authpage";

  return (
    <div id="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/authpage" replace />} />
        <Route path="/authpage" element={<AuthPage />} />
      </Routes>
      {!isAuthPage && (
        <MainPage>
          <Routes>
            <Route path="/calendar" element={<DreamCalendar />} />
            <Route path="/mainpage" element={<RightSideBar />} />
          </Routes>
        </MainPage>
      )}
    </div>
  );
}

export default App;
