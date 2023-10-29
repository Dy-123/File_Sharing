import { useEffect, useState } from "react";

function PublicFiles(){
  
  const [tableContent,setTableContent] = useState("");
  // const [linearContent, setLinearContent] = useState("");

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
    if(typeof filename === 'string' && filename.length>30){
      return filename.slice(0, 15) + '...' + filename.slice(filename.length-15,filename.length) + '';
    }
    return filename;
  }

  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(process.env.REACT_APP_PUBLIC_FILES);
          const publicFiles = await response.json();
          publicFiles.reverse();

          var tableContent = [];
          for(var i=0;i<publicFiles.length;++i){
            tableContent.push(
              <tr key={publicFiles[i].metadata.shortname}>
                <td>{publicFiles[i].metadata.shortname}</td>
                <td>{trimFileName(publicFiles[i].filename)}</td>
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

          // var linearContent = [];
          // for(var i=0;i<publicFiles.length;++i){
          //   linearContent.push(
          //     <div key={'linear'+publicFiles[i].metadata.shortname}>
          //       <p>{publicFiles[i].metadata.shortname}</p>
          //       <p>{trimFileName(publicFiles[i].filename)}</p>
          //       <p>
          //         { Math.round(((publicFiles[i].length/(1024*1024))*10))/10 === 0 ? 
          //         Math.round(((publicFiles[i].length/(1024*1024))*100))/100 === 0 ?
          //         `${Math.round(((publicFiles[i].length)*10))/10} B` : 
          //         `${Math.round(((publicFiles[i].length/(1024))*10))/10} KB` :
          //         `${Math.round(((publicFiles[i].length/(1024*1024))*10))/10} MB` }
          //       </p>
          //       <p>{formattedTime(publicFiles[i].metadata.expiryTime)}</p>
          //       <p>{publicFiles[i].metadata.noOfDownload}</p>     
          //     </div>           
          //   );
          // }

          setTableContent(tableContent);
          // setLinearContent(linearContent);
        } catch (error) {
          console.error("Error fetching public files:", error);
        }
      };
    
      fetchData();
    }, []);
    
    return (
        <div className="publicFiles">
          { tableContent === "" ? ( <p>Public directory is loading...</p>) : 
            ( 
              <div>
                <div className="table-responsive">
                  <table className="table table-hover" style={{"width":"100%"}}>
                    <thead>
                      <tr>
                        <td style={{"width":"10%"}}>File ID</td>
                        <td style={{"width":"35%"}}>File Name</td>
                        <td style={{"width":"10%"}}>Size</td>
                        <td style={{"width":"25%"}}>Expiry Time</td>
                        <td style={{"width":"10%"}}>Download Left</td>
                      </tr>
                    </thead>
                    <tbody>{tableContent}</tbody>
                  </table>
                </div>

                {/* <div>
                  {linearContent}
                </div> */}
              </div>
            )
          }
        </div>
    );

}

export default PublicFiles;