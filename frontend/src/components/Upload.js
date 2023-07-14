import { useState } from "react";

function Upload(){

    const [file,setFile] = useState("null");
    const [text,setText] = useState("To share files, click \"Choose File\" to select from your computer. Start the upload process by clicking the button. Larger files may require more time and a stable internet connection.");
    const [disabled,setDisabled] = useState(false);
    const [isButtonVisible, setButtonVisible] = useState(false);
    const [copyText,setCopyText] = useState("");

    const changeEvent = (event) => {
        setFile(event.target.files[0]);
    }

    // using fetch to upload files but fetch doesn't have support to monitor upload progress. Src: https://javascript.info/fetch-progress
    // const uploadEvent = () => {

    //     setDisabled(true);

    //     if (file==="null") {
    //       setText("Select a file");
    //       setDisabled(false);
    //     } else {

    //       const formData = new FormData();
    //       formData.append("fileUpload", file);
    //       setText("File is being uploaded...");
    
    //       fetch("http://localhost:5000/upload", {
    //         method: "POST",
    //         body: formData,
    //       })
    //         .then((response) => response.text())
    //         .then((data) => {
    //           setText(data);
    //           setDisabled(false);
    //         })
    //         .catch((error) => {
    //           setText("Error uploading file:", error);
    //           setDisabled(false);
    //         });
    //     }
    // };

    const uploadEvent = () => {

      setDisabled(true);

      if (file==="null") {
        setText("Select a file");
        setDisabled(false);
      } else {

        const formData = new FormData();
        formData.append("fileUpload", file);
        setText("File is being uploaded...");

        const xhr = new XMLHttpRequest();

        // listen for upload progress
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

        xhr.open('POST',"http://localhost:5000/upload");
        xhr.send(formData);

      }

    };

    return (
        <div>

            <div className="upload">
                <input type='file' onChange={changeEvent}></input>
                <button className="btn btn-primary" disabled={disabled} onClick={uploadEvent}>Upload</button>
            </div>

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