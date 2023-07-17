import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import './App.css';
import Header from './components/Header';
import Download from './components/Download';
import Upload from './components/Upload';
import PublicFiles from './components/PublicFiles';

function App() {
  return (
    <>
      <Header/>

      <Router>
          <nav className="navBarLinks navbar-light bg-light ">
            <Link to="/">Download</Link>
            <Link to="/upload" style={{"marginRight":"23px", "marginLeft":"23px"}}>Upload</Link>
            <Link to="/publicfiles">Public Files</Link>
          </nav>

          <Routes>
            <Route path="/" element={<Download />} /> 
            <Route path="/upload" element={<Upload />} />
            <Route path="/publicfiles" element={<PublicFiles />} />
          </Routes>
        
      </Router>
    </>
  );
}

export default App;
