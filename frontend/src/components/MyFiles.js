import { useEffect, useState } from "react";

function MyFiles(){
  
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
          const response = await fetch(process.env.REACT_APP_PUBLIC_FILES);
          const privateFiles = await response.json();
          privateFiles.reverse();
          
          console.log(privateFiles);

          var tableContent = [];
          for(var i=0;i<privateFiles.length;++i){
            tableContent.push(
              <tr key={privateFiles[i].metadata.shortname}>
                <td>{privateFiles[i].metadata.shortname}</td>
                <td>{privateFiles[i].filename}</td>
                <td>
                  { Math.round(((privateFiles[i].length/(1024*1024))*10))/10 === 0 ? 
                  Math.round(((privateFiles[i].length/(1024*1024))*100))/100 === 0 ?
                  `${Math.round(((privateFiles[i].length)*10))/10} B` : 
                  `${Math.round(((privateFiles[i].length/(1024))*10))/10} KB` :
                  `${Math.round(((privateFiles[i].length/(1024*1024))*10))/10} MB` }
                </td>
                <td>{formattedTime(privateFiles[i].metadata.expiryTime)}</td>
                <td>{privateFiles[i].metadata.noOfDownload}</td>
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

    const loggedInCheck = () => {
        return false;
    }
    
    return (

        loggedInCheck() === true ?
        (<div className="privateFiles">
          { tableContent === "" ? ( <p>Personal directory is loading...</p>) : 
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
        </div>) :
        (<div className="privateFiles"><p>Log in to view your files.</p></div>)
        

        
    );

}

export default MyFiles;