import {useState} from "react";

function Download(){
    const [file,setFile] = useState(null);
    const [text,setText] = useState("Enter file id to download the file");
    const [disabled,setDisabled] = useState(false); 
    const [passwordProtection, setPasswordProtection] = useState(false);
    const [passwordValue,setPasswordValue] = useState("");

    const changeEvent = (event) =>{
        setFile(event.target.value);
    }

    function downloadFile(url,fileName) {

        setText("Download has been started. Downloading...");
        setDisabled(true);

        var form = new FormData();
        form.append("filename",fileName);
        form.append("password",passwordValue);

        var originalName;

        fetch(url,{
          method: 'POST',
          body: form
        })
        .then(response => {

          if(response.status===401){
            throw Error("File is password protected. Enter a correct file password to download it.");
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
              // const progress = (loaded / total) * 100;
      
              // Update the progress here, e.g., update a progress bar
              setText(loaded/(1024*1024) + " MB of file: " + fileName + " has been downloaded. Downloading...");
              // console.log(loaded/(1024*1024) + " MB of file: " + fileName + " has been downloaded.");
      
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
            setDisabled(false);
          })
          .catch(error => {
            // Handle any errors that occurred during the download
            setText('Error downloading file:\t' + error);
            setDisabled(false);
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

            <div className="input-container" style={{"marginTop":"1rem"}}>
              <div className="did-floating-label-content">
                <input className="did-floating-input" type="text" placeholder=" " onChange={changeEvent}></input>
                <label className="did-floating-label">File ID</label>
              </div>
            </div>

            <div className="downloadOptions" style={{"marginBottom":"1rem"}}>
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

            <button className="btn btn-primary" disabled={disabled} onClick={downloadEvent}>Download</button>
        </div>

          <div>
              <p className="text">{text}</p>
          </div>

      </>
    );
}

export default Download;