import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import './App.css';
import Header from './components/Header';
import Download from './components/Download';
import Upload from './components/Upload';
import PublicFiles from './components/PublicFiles';
import MyFiles from './components/MyFiles';
import { useState } from "react";

function App() {

  const [loginState,setLoginState] = useState(false);

  // Download component state
  const [fileDownload,setFileDownload] = useState(null);
  const [textDownload,setTextDownload] = useState("Enter file id to download the file");
  const [downloadButtonDisabledDownload,setDownloadButtonDisabledDownload] = useState(false); 
  const [passwordProtectionDownload, setPasswordProtectionDownload] = useState(false);
  const [passwordValueDownload,setPasswordValueDownload] = useState("");
  const [fileDetailDownload,setFileDetailDownload] = useState([]);
  const [isDetailAvailableDownload,setIsDetailAvailableDownload]= useState(false);
  const [downloadedPercentageDownload,setDownloadedPercentageDownload] = useState(0);
  const [downloadTextDownload,setDownloadTextDownload] = useState("Download starting...");

  // Upload component state
  const [fileUpload,setFileUpload] = useState("null");
  const [textUpload,setTextUpload] = useState("Select a file, set no of copy and time till which it can be downladed.");
  const [disabledUpload,setDisabledUpload] = useState(false);
  const [isButtonVisibleUpload, setButtonVisibleUpload] = useState(false);
  const [copyTextUpload,setCopyTextUpload] = useState("");
  const [privacyUpload, setPrivacyUpload] = useState(false);
  const [downloadCountUpload,setDownloadCountUpload] = useState(1);
  const [expDateUpload, setExpDateUpload] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [passwordValueUpload,setPasswordValueUpload] = useState("");
  const [uploadPercentageUpload,setUploadPercentageUpload] = useState(0);
  const [uploadStartedUpload,setUploadStartedUpload] = useState(false);
  const [uploadTextUpload,setUploadTextUpload] = useState("");
  const [isUplaodedUpload,setIsUploadedUpload] = useState(false);

  const downloadState = {
    fileDownload,
    setFileDownload,
    textDownload,
    setTextDownload,
    downloadButtonDisabledDownload,
    setDownloadButtonDisabledDownload,
    passwordProtectionDownload,
    setPasswordProtectionDownload,
    passwordValueDownload,
    setPasswordValueDownload,
    fileDetailDownload,
    setFileDetailDownload,
    isDetailAvailableDownload,
    setIsDetailAvailableDownload,
    downloadedPercentageDownload,
    setDownloadedPercentageDownload,
    downloadTextDownload,
    setDownloadTextDownload,
  };

  const uploadState = {
    fileUpload,
    setFileUpload,
    textUpload,
    setTextUpload,
    disabledUpload,
    setDisabledUpload,
    isButtonVisibleUpload,
    setButtonVisibleUpload,
    copyTextUpload,
    setCopyTextUpload,
    privacyUpload,
    setPrivacyUpload,
    downloadCountUpload,
    setDownloadCountUpload,
    expDateUpload,
    setExpDateUpload,
    passwordValueUpload,
    setPasswordValueUpload,
    uploadPercentageUpload,
    setUploadPercentageUpload,
    uploadStartedUpload,
    setUploadStartedUpload,
    uploadTextUpload,
    setUploadTextUpload,
    isUplaodedUpload,
    setIsUploadedUpload,
  };
  
  

  return (
    <>
      <Header loginState={loginState} setLoginState={setLoginState}/>

      <Router>
          <nav className="navBarLinks navbar-light bg-light">
            <Link to="/">Download</Link>
            <Link to="/upload" style={{"marginRight":"23px", "marginLeft":"23px"}}>Upload</Link>
            <Link to="/publicfiles">Public Files</Link>
            <Link to="/myfiles" style={{"marginLeft":"23px"}}>My Files</Link>
          </nav>

          <Routes>
            <Route path="/" element={<Download {...downloadState}/>} /> 
            <Route path="/upload" element={<Upload {...uploadState}/>} />
            <Route path="/publicfiles" element={<PublicFiles />} />
            <Route path="/myfiles" element={<MyFiles loginState={loginState} setLoginState={setLoginState}/>} />
          </Routes>
        
      </Router>
    </>
  );
}

export default App;
