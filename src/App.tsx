/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingView from "./components/LandingView";
import TownView from "./components/TownView";
import TownMapView from "./components/TownMapView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/:townId/info" element={<TownView />} />
        <Route path="/:townId/map" element={<TownMapView />} />
      </Routes>
    </BrowserRouter>
  );
}
