import { useState } from "react";

function Upload(){

    const [file,setFile] = useState("null");
    const [text,setText] = useState("To share files, click \"Choose File\" to select from your computer. Start the upload process by clicking the button. Larger files may require more time and a stable internet connection.");
    const [disabled,setDisabled] = useState(false);
    const [isButtonVisible, setButtonVisible] = useState(false);
    const [copyText,setCopyText] = useState("");
    const [privacy, setPrivacy] = useState(false);
    const [downloadCount,setDownloadCount] = useState(1);
    const [expDate, setExpDate] = useState("");
    const [passwordProtection,setPasswordProtection] = useState(false);
    const [passwordValue,setPasswordValue] = useState("");

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
      }else if(passwordProtection===true && passwordValue===""){
        setText("Password protection is selected enter a password");
        setDisabled(false);
      }else {

        const formData = new FormData();
        
        // https://stackoverflow.com/questions/39589022/node-js-multer-and-req-body-empty
        formData.append("expiryTime",expDate);
        formData.append("noOfDownload",downloadCount);
        formData.append("isPublic",privacy);
        formData.append("password",passwordValue);
        formData.append("fileUpload", file);

        setText("File is being uploaded...");

        const xhr = new XMLHttpRequest();

        // listen for upload progress
        // using fetch to upload files but fetch doesn't have support to monitor upload progress. Src: https://javascript.info/fetch-progress
        // See previous version of file for commented fetch implemented
        xhr.upload.onprogress = function (event) {
          // find the percentage of uploaded
          let percent = Math.round((event.loaded / event.total)*100);
          let loaded = Math.round( event.loaded/(1024*1024) );
          let total = Math.round( event.total/(1024*1024) );
          setText("Uploaded "+loaded+"MB out of "+total+"MB. Upload progress is: "+percent+" percent. Uploading...");
          console.log(percent);
        };

        // handle error
        xhr.upload.onerror = function () {
          setText("Error uploading file:"+xhr.status);
          setDisabled(false);
        };

        // listen for response which will give the link
        xhr.onreadystatechange = function () {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            setText("File has been uploaded successfully! File id is: \""+xhr.responseText+"\"");
            setDisabled(false);
            setCopyText(xhr.responseText);
            setButtonVisible(true);
          }
        };

        xhr.open('POST',process.env.REACT_APP_UPLOAD);
        xhr.send(formData);

      }

    };

    const privacyToggleButton = () => {
      setPrivacy(prevState => !prevState);
    };

    const countDownloadEvent = (event) => {
      setDownloadCount(event.target.value);
    }

    const expiryDateEvent = (event) => {
      setExpDate(event.target.value);
    }

    const passwordToggleButton = () => {
      setPasswordProtection(!passwordProtection);
    }

    const passwordInputEvent = (event) => {
      setPasswordValue(event.target.value);
    }

    return (
        <div>

            <div className="upload">
                <input type='file' onChange={fileSelectEvent}></input>
                <button className="btn btn-primary" disabled={disabled} onClick={uploadEvent}>Upload</button>
            </div>

            <div className="uploadOptions">

              <label style={{"marginRight":"5px"}}>Private</label>
              <div
                className={`toggle ${privacy ? 'on' : 'off'}`}
                onClick={privacyToggleButton}>
              </div>
              <label style={{"marginRight":"25px","marginLeft":"5px" }}>Public</label>

              <label>Download Count</label>
              <input type='number' className="inputWidthA" onChange={countDownloadEvent} value={downloadCount}></input>

            </div>

            <div className="uploadOptions">
              <label>File Expiry</label>
              <input type='datetime-local' className="inputWidthB" onChange={expiryDateEvent}></input>
            </div>

            { privacy===false ?
            (<div className="uploadOptions">
              <label style={{"marginRight":"3px"}} >Password Protection</label>
              <div
                className={`toggle ${passwordProtection ? 'on' : 'off'}`}
                onClick={passwordToggleButton}>
              </div>
              {passwordProtection===true ? <input type="password" style={{"marginLeft":"3px"}} className="inputWidthC" onChange={passwordInputEvent} value={passwordValue}></input> : <></>}
            </div>) : <></>
            }


            <div>
                <p className="text">{text}</p>
            </div>

            <div className="hiddenButton">
              {isButtonVisible && <button className="btn btn-primary" onClick={() => {navigator.clipboard.writeText(copyText)} }>Click to copy file id</button>}
            </div>

        </div>


    );
}

export default Upload;