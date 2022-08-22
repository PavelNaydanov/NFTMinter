
import { Routes, Route } from "react-router-dom";

import { Minter } from 'app/components';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route path="profile" element={<div>Profile</div>} />
        <Route path="minter" element={<Minter />} />
      </Routes>
    </div>
  );
}

export default App;
