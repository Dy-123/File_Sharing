import { useEffect, useState } from "react";

function PublicFiles(){
  
  const [tableContent,setTableContent] = useState("");

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


  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:5000/publicFiles");
          const publicFiles = await response.json();
          publicFiles.reverse();
          
          console.log(publicFiles);
          var tableContent = [];
          // tableContent.push(
          //   <tr key="header">
          //     <td>File id</td>
          //     <td>File Name</td>
          //     <td>Size</td>
          //     <td>Expiry Time</td>
          //     <td>Download Left</td>
          //   </tr>
          // );
          for(var i=0;i<publicFiles.length;++i){
            tableContent.push(
              <tr key={publicFiles[i].metadata.shortname}>
                <td>{publicFiles[i].metadata.shortname}</td>
                <td>{publicFiles[i].filename}</td>
                <td>
                  { Math.round(((publicFiles[i].length/(1024*1024))*10))/10 === 0 ? 
                  Math.round(((publicFiles[i].length/(1024*1024))*100))/100 === 0 ?
                  `${Math.round(((publicFiles[i].length)*10))/10} B` : 
                  `${Math.round(((publicFiles[i].length/(1024))*10))/10} KB` :
                  `${Math.round(((publicFiles[i].length/(1024*1024))*10))/10} MB` }
                </td>
                <td>{formattedTime(publicFiles[i].metadata.expiryTime)}</td>
                <td>{publicFiles[i].metadata.noOfDownload}</td>
              </tr>
            );
          }
          setTableContent(tableContent);
        } catch (error) {
          console.error("Error fetching public files:", error);
        }
      };
    
      fetchData();
    }, []);
    
    return (
        <div className="publicFiles">
          { tableContent === "" ? ( <p>Public directory is loading...</p>) : 
            ( <table className="table table-hover">
              <thead>
                <tr>
                  <td>File id</td>
                  <td>File Name</td>
                  <td>Size</td>
                  <td>Expiry Time</td>
                  <td>Download Left</td>
                </tr>
              </thead>
              <tbody>{tableContent}</tbody>
            </table> ) 
          }
        </div>
    );

}

export default PublicFiles;