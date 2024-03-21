import React from 'react';
import LandingPage from './pages/LandingPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />}/>
          <Route path="home" element={<MainPage />} />

            {/* <Route path="*" element={<NoMatch />} /> */}
          {/* </Route> */}
        </Routes>
        <Footer />
    </Router>
    </div>
  );
}

export default App;