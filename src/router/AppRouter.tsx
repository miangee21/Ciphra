//src/router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSessionStore } from "@/store/sessionStore";
import { useLockStore } from "@/store/lockStore";
import { ramStore } from "@/lib/storage/ram";
import { hasPinStorage } from "@/lib/storage/pinStorage";
import SplashScreen from "@/features/splash/SplashScreen";
import LoginPage from "@/features/auth/LoginPage";
import SignupPage from "@/features/auth/SignupPage";
import HomePage from "@/features/home/HomePage";
import FolderPage from "@/features/folder/FolderPage";
import EditorPage from "@/features/editor/EditorPage";
import RecycleBinPage from "@/features/recycle/RecycleBinPage";
import SearchPage from "@/features/search/SearchPage";
import SettingsPage from "@/features/settings/SettingsPage";
import LockScreen from "@/features/lock/LockScreen";

// Protects all private routes
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useSessionStore();
  const { isLocked } = useLockStore();

  // 1. Not logged in at all (no active session)
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2. Session exists, but private key is missing from RAM (App refreshed or closed)
  if (!ramStore.hasKey()) {
    if (hasPinStorage()) {
      return <LockScreen />; // Force Lock Screen to decrypt key with PIN
    } else {
      return <Navigate to="/login" replace />; // No PIN setup, must login via 12-words
    }
  }

  // 3. Key is in RAM, but user locked the app manually or due to inactivity
  if (isLocked) {
    return <LockScreen />;
  }

  // 4. Fully unlocked and session active
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/folder/:id"
          element={
            <PrivateRoute>
              <FolderPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/doc/:id"
          element={
            <PrivateRoute>
              <EditorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/recycle"
          element={
            <PrivateRoute>
              <RecycleBinPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <SearchPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
