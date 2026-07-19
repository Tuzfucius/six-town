/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingView from "./components/LandingView";
import TownView from "./components/TownView";
import TownMapView from "./components/TownMapView";
import MetroOverviewView from "./components/MetroOverviewView";
import IndustryChainView from "./components/IndustryChainView";
import ChatWidget from "./components/ChatWidget";

function AnimatedRoutes() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.992 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 1.004 }}
        transition={transition}
        className="min-h-screen"
      >
        <Routes location={location}>
          <Route path="/" element={<LandingView />} />
          <Route path="/metro" element={<MetroOverviewView />} />
          <Route path="/industry-chain" element={<IndustryChainView />} />
          <Route path="/:townId/info" element={<TownView />} />
          <Route path="/:townId/map" element={<TownMapView />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <ChatWidget />
    </BrowserRouter>
  );
}
