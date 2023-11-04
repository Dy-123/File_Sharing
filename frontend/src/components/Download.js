import {useState} from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function Download(){
    const [file,setFile] = useState(null);
    const [text,setText] = useState("Enter file id to download the file");
    const [downloadButtonDisabled,setDownloadButtonDisabled] = useState(false); 
    const [passwordProtection, setPasswordProtection] = useState(false);
    const [passwordValue,setPasswordValue] = useState("");
    const [fileDetail,setFileDetail] = useState([]);
    const [isDetailAvailable,setIsDetailAvailable]= useState(false);
    const [downloadedPercentage,setDownloadedPercentage] = useState(0);
    const [downloadText,setDownloadText] = useState("Download starting...");

    const formattedTime = (time) => {

      const timestamp = new Date(time);
      
      const hours = timestamp.getHours();
      const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
      const minutes = timestamp.getMinutes();
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
  
      const day = timestamp.getDate();
      const month = timestamp.toLocaleString('default', { month: 'short' });
      const year = timestamp.getFullYear().toString().slice(-2);
      
      return `${day} ${month} ${year} ${formattedHours}:${formattedMinutes} ${ampm}`;
  
    }

    const trimFileName = (filename) => {
      if(typeof filename === 'string' && filename.length>34){
        return filename.slice(0, 17) + '...' + filename.slice(filename.length-17,filename.length) + '';
      }
      return filename;
    }

    const changeEvent = (event) =>{
        setFile(event.target.value);
    }
    
    const downloadFile = async (url,fileName) => {

      const fileDetailUrl = `${process.env.REACT_APP_FILE_DETAIL}?ID=${fileName}&pass=${passwordValue}`;
      console.log(fileDetailUrl);
      const response = await fetch(fileDetailUrl);

      if(response.status===200){
        const file = await response.json();
        var fileArray = [file.filename,file.size,file.shortname,file.expiryTime,file.noOfDownload]
        setFileDetail(fileArray);
        setIsDetailAvailable(true);
      }

      setText("Download has been started. Downloading...");
      setDownloadButtonDisabled(true);

      var form = new FormData();
      form.append("filename",fileName);
      form.append("password",passwordValue);

      var originalName;

      fetch(url,{
        method: 'POST',
        body: form
      })
      .then((response) => {

        if(response.status===401){
          throw Error("Wrong password / password protected.");
        }else if (!response.ok) {
          throw Error("File not found");
        }

        const contentLength = response.headers.get("content-disposition");
        originalName = contentLength.substring(22,contentLength.length-1);

        let loaded = 0;
        const chunks = [];
    
        const reader = response.body.getReader();
    
        function read() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              return chunks;
            }
            
            loaded += value.length;
            const progress = ( loaded / fileArray[1] ) * 100;

            setDownloadedPercentage(progress.toFixed(0));
            // Update the progress here, e.g., update a progress bar
            setDownloadText("Downloaded: "+(loaded/(1024*1024)).toFixed(0)+ "MB / " + (fileArray[1]/(1024*1024)).toFixed(0) + "MB");
            setText("Downloading...");
    
            chunks.push(value);
            return read();
          });
        }
    
        return read();

        })
        .then(chunks => {
          const blob = new Blob(chunks);
          const url = URL.createObjectURL(blob);
      
          const a = document.createElement('a');
          a.href = url;
          a.download = originalName;
          a.click();
      
          URL.revokeObjectURL(url);
        })
        .then(() => {
          setText('File downloaded successfully!');
          setDownloadButtonDisabled(false);
          setIsDetailAvailable(false);
        })
        .catch(error => {
          // Handle any errors that occurred during the download
          setText('Error downloading file. \t' + error);
          setDownloadButtonDisabled(false);
          setIsDetailAvailable(false);
        });
          
      }

    const downloadEvent = () => {
        let fileUrl = process.env.REACT_APP_DOWNLOAD;
        downloadFile(fileUrl,file);
    }

    const passwordToggleButton = () => {
      setPasswordProtection(!passwordProtection);
    }

    const passwordInputEvent = (event) => {
      setPasswordValue(event.target.value);
    }

    return(
      <>
        <div className="uploadCard">
          {isDetailAvailable===false ?
            <>
              <div className="input-container" style={{"marginTop":"1rem"}}>
                <div className="did-floating-label-content">
                  <input className="did-floating-input" type="text" placeholder=" " onChange={changeEvent}></input>
                  <label className="did-floating-label">File ID</label>
                </div>
              </div>

              <div className="downloadOptions" style={{"marginBottom":"0.8rem","marginTop":"0.8rem"}}>
                <label style={{"marginRight":"3px"}} >Password Protected</label>
                <div
                  className={`toggle ${passwordProtection ? 'on' : 'off'}`}
                  onClick={passwordToggleButton}>
                </div>
              </div>

              <div className="input-container">
                <div className="did-floating-label-content">
                  <input className="did-floating-input" type="password" placeholder=" " onChange={passwordInputEvent} value={passwordValue} disabled={!passwordProtection}></input>
                  <label className="did-floating-label">File Password</label>
                </div>
              </div>
            </> :
            <>
              <div style={{"marginBottom":"15px"}}>{downloadText}</div>
              <div style={{"width":"100px","height":"100px","marginBottom":"10px"}}>
                <CircularProgressbar value={downloadedPercentage} text={`${downloadedPercentage}%`} styles={buildStyles({textSize:'20px'})}/>
              </div>
              <div className="download-file-info">
                <div className="file-info-display-box">
                  <div className="file-info-key">File Name</div>
                  <div className="file-info-value">{trimFileName(fileDetail[0])}</div>
                </div>
                <div className="file-info-display-box">
                  <div className="file-info-key">File Expiry Time</div>
                  <div className="file-info-value">{formattedTime(fileDetail[3])}</div>
                </div>
                <div className="file-info-display-box">
                  <div className="file-info-key">Download Left</div>
                  <div className="file-info-value">{fileDetail[4]}</div>
                </div>
              </div>
            </>}

            <button className="btn btn-primary" style={{"marginTop":"10px"}} disabled={downloadButtonDisabled} onClick={downloadEvent}>Download</button>
        </div>

          <div>
              <p className="text">{text}</p>
          </div>

      </>
    );
}

export default Download;