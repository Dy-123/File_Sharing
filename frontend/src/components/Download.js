import {useState} from "react";


function Download(){
    const [file,setFile] = useState(null);
    const [text,setText] = useState("To download a shared file, enter its link or ID, click \"Download,\" and save it to your computer. Ensure sufficient storage space and a stable internet connection.");
    const [disabled,setDisabled] = useState(false);

    const changeEvent = (event) =>{
        setFile(event.target.value);
    }

    function downloadFile(url,fileName) {

        setText("Download has been started. Downloading...");
        setDisabled(true);
        var originalName;

        fetch(url)
        .then(response => {

          // console.log(response); 

          if (!response.ok) {
              throw Error("File not found")   ;
          }
          

          const contentLength = response.headers.get("content-disposition");
          // console.log(contentLength);
          // console.log(contentLength.substring(22,contentLength.length-1));
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
              console.log(loaded/(1024*1024) + " MB of file: " + fileName + " has been downloaded.");
      
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
          
        // .then((response) => {
        //     console.log(response);
        //     if (response.ok) {
        //       return response.blob();
        //     } else {
        //       throw alert("File not found");
        //     }
        //   })
        //   .then((blob) => {
        //     // Create a temporary URL for the blob object
        //     const url = window.URL.createObjectURL(new Blob([blob]));
            
        //     // Create a temporary link element to trigger the download
        //     const link = document.createElement("a");
        //     link.href = url;
        //     link.setAttribute("download", fileName);
            
        //     // Append the link to the document and trigger the click event
        //     document.body.appendChild(link);
        //     link.click();
            
        //     // Clean up by removing the temporary link and revoking the object URL
        //     document.body.removeChild(link);
        //     window.URL.revokeObjectURL(url);
        //   })
        //   .catch((error) => {
        //     // Handle any errors that occur during the fetch request
        //     console.error("Error downloading file:", error);
        //   });
      }

    const downloadEvent = () => {
        let fileUrl = "http://localhost:5000/download?filename="+file;
        downloadFile(fileUrl,file);
    }

    return(
        <div>
            <div className="download">
                <input type='text' placeholder='Enter file id' style={{ marginRight: '10px',  width: "270px" }} onChange={changeEvent}></input>
                <button className="btn btn-primary" disabled={disabled} onClick={downloadEvent}>Download</button>            
            </div>

            <div>
                <p className="text">{text}</p>
            </div>

        </div>
    );
}

export default Download;