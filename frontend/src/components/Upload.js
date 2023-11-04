import { useState, useRef } from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function Upload(){

    const [file,setFile] = useState("null");
    const [text,setText] = useState("Select a file, set no of copy and time till which it can be downladed.");
    const [disabled,setDisabled] = useState(false);
    const [isButtonVisible, setButtonVisible] = useState(false);
    const [copyText,setCopyText] = useState("");
    const [privacy, setPrivacy] = useState(false);
    const [downloadCount,setDownloadCount] = useState(1);
    const [expDate, setExpDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    const [passwordValue,setPasswordValue] = useState("");
    const [uploadPercentage,setUploadPercentage] = useState(0);
    const [uploadStarted,setUploadStarted] = useState(false);
    const [uploadText,setUploadText] = useState("");
    const [isUplaoded,setIsUploaded] = useState(false);

    const fileSelectEvent = (event) => {
        setFile(event.target.files[0]);
    }


    const uploadEvent = () => {

      setDisabled(true);

      if (file==="null" || file===undefined) {
        setText("Select a file");
        setDisabled(false);
      } else if(downloadCount==="" || downloadCount<1){
        setText("Enter a valid Download Count number");
        setDisabled(false);
      } else if(expDate==="" || Date.parse(expDate)<=Date.now()){
        setText("Enter a valid file expiry time");
        setDisabled(false);
      } else {

        const formData = new FormData();
        formData.append("expiryTime",expDate);
        formData.append("noOfDownload",downloadCount);
        formData.append("isPublic",privacy);
        formData.append("password",passwordValue);
        formData.append("fileUpload", file);

        setText("File is being uploaded...");
        setUploadStarted(true);

        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;                        // XMLHttpRequest will include credentials like cookies in the request headers when sending the request to the server

        xhr.upload.onprogress = function (event) {
          // find the percentage of uploaded
          let percent = Math.round((event.loaded / event.total)*100);
          let loaded = Math.round( event.loaded/(1024*1024) );
          let total = Math.round( event.total/(1024*1024) );
          setUploadPercentage(percent);
          setUploadText("Uploaded: "+loaded+"MB / "+total+"MB");
          setText("Uploading...");
          // console.log(percent);
        };

        // handle error
        xhr.upload.onerror = function () {
          setText("Error uploading file: "+xhr.status);
          setDisabled(false);
          setUploadStarted(false);
        };

        // listen for response which will give the link
        xhr.onreadystatechange = function () {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            setText("Uploaded! File id is: \""+xhr.responseText+"\"");
            setDisabled(false);
            setCopyText(xhr.responseText);
            setButtonVisible(true);
            setUploadStarted(false);
            setIsUploaded(true);
          }
        };

        xhr.open('POST',process.env.REACT_APP_UPLOAD);
        xhr.send(formData);

      }

    };

    const privacyToggleButton = () => {
      if(!isUplaoded){
        setPrivacy(prevState => !prevState);
        setPasswordValue("");
      }
    };

    const countDownloadEvent = (event) => {
      setDownloadCount(event.target.value);
    }

    const expiryDateEvent = (event) => {
      setExpDate(event.target.value);
    }

    const passwordInputEvent = (event) => {
      setPasswordValue(event.target.value);
    }

    const fileInputRef = useRef(null);

    const handleDivClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const trimFileName = (sentence) => {
      if(sentence === 'null' || sentence === undefined){
        return sentence;
      }
      sentence = sentence.name; 
      if(typeof sentence === 'string' && sentence.length>12){
        return sentence.slice(0, 5) + '...' + sentence.slice(sentence.length-7,sentence.length) + '';
      }
      return sentence;
    }

    const removeFile = () => {
        setFile("null");
        setIsUploaded(false);
        setButtonVisible(false);
        setText("Select a file, set no of copy and time till which it can be downladed.");
    }


    return (
      <>
        <div className="uploadCard">
          { file === 'null' || file === undefined ?
            (<div className="upload" onClick={handleDivClick}>
              <div>
                  <img src="upload.png" alt="uploadIcon" id="uploadImage"/>
                  <input type='file' id="file-input" ref={fileInputRef} onChange={fileSelectEvent}></input>
              </div>
              
              <div className="uploadText">
                <label id="file-input-label">Upload a file</label><br/>
                <label id="selectFolder">Or drag and drop</label>
              </div>
            </div>)
            :
            (<div className="fileUploadOptions">
              <img src="file.png" alt="fileIcon" id="fileImage" />
              <p id="fileName">{trimFileName(file)}</p>
              <img src="xmark.png" alt="closeIcon" id="xmarkImage" onClick={removeFile} style={{"visibility":`${uploadStarted===true ? 'hidden' : 'visible'}`}}/>
            </div>)
          }

          { uploadStarted === false ?
            <>
              <div className="uploadOptions" style={{"paddingLeft":"15px"}} >
                <label style={{"marginRight":"5px"}}>Private</label>
                <div
                  className={`toggle ${privacy ? 'on' : 'off'}`}
                  onClick={privacyToggleButton}>
                </div>
                <label style={{"marginRight":"25px","marginLeft":"5px" }}>Public</label>
              </div>

              <div className="input-container">
                <div className="did-floating-label-content">
                  <input className="did-floating-input" disabled={isUplaoded} style={{minWidth:"250px"}} type="number" placeholder=" " onChange={countDownloadEvent} value={downloadCount}></input>
                  <label className="did-floating-label">Download Count</label>
                </div>
              </div>

              <div className="input-container">
                <div className="did-floating-label-content">
                  <input className="did-floating-input" disabled={isUplaoded} style={{minWidth:"250px"}} type="datetime-local" placeholder=" " onChange={expiryDateEvent} value={expDate}></input>
                  <label className="did-floating-label">File Expiry Time</label>
                </div>
              </div>

              <div className="input-container">
                <div className="did-floating-label-content">
                  <input className="did-floating-input" style={{minWidth:"250px"}} disabled={privacy ||isUplaoded} type="password" placeholder=" " onChange={passwordInputEvent} value={passwordValue}></input>
                  <label className="did-floating-label">File Password</label>
                </div>
              </div>
            </> :  
            <>
              <div style={{"marginBottom":"15px"}}>{uploadText}</div>
              <div style={{"width":"150px","height":"150px", "marginBottom":"20px"}}>
                <CircularProgressbar value={uploadPercentage} text={`${uploadPercentage}%`} styles={buildStyles({textSize:'20px'})}/>
              </div>
            </>}
            
            { isButtonVisible &&
              <div className="hiddenButton">
                <button className="btn btn-primary" onClick={() => {navigator.clipboard.writeText(copyText)} }>Click to copy file id</button>
              </div>
            }

            {!isUplaoded && <button className="btn btn-primary" style={{"marginTop":"5px"}} disabled={disabled} onClick={uploadEvent}>Upload</button>}

        </div>

      

        <div>
          <p className="text">{text}</p>
        </div>

      </>
    );
}

export default Upload;