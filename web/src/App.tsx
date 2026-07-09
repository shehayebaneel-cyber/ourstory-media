import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "./context/Auth.tsx";
import { Layout } from "./components/Layout.tsx";
import { Login } from "./pages/Login.tsx";
import { Home } from "./pages/Home.tsx";
import { Timeline } from "./pages/Timeline.tsx";
import { Journal } from "./pages/Journal.tsx";
import { Gallery } from "./pages/Gallery.tsx";
import { MapPage } from "./pages/MapPage.tsx";
import { Bucket } from "./pages/Bucket.tsx";
import { Letters } from "./pages/Letters.tsx";
import { Countdowns } from "./pages/Countdowns.tsx";
import { Favorites } from "./pages/Favorites.tsx";
import { Playlist } from "./pages/Playlist.tsx";
import { Notes } from "./pages/Notes.tsx";
import { Trips } from "./pages/Trips.tsx";
import { Gifts } from "./pages/Gifts.tsx";
import { Capsules } from "./pages/Capsules.tsx";
import { Random } from "./pages/Random.tsx";
import { Search } from "./pages/Search.tsx";
import { Stats } from "./pages/Stats.tsx";
import { More } from "./pages/More.tsx";

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>;
  if (!user) return <Login />;
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.26, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/bucket" element={<Bucket />} />
            <Route path="/letters" element={<Letters />} />
            <Route path="/countdowns" element={<Countdowns />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/playlist" element={<Playlist />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/gifts" element={<Gifts />} />
            <Route path="/capsules" element={<Capsules />} />
            <Route path="/random" element={<Random />} />
            <Route path="/search" element={<Search />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/more" element={<More />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
