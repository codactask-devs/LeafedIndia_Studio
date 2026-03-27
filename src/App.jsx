import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Editor from "./pages/Editor";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Editor />} />
        {/* You can add more routes here in the future */}
      </Routes>
    </Router>
  );
}

export default App;


