import { useEffect, useState } from "react";

function PublicFiles(){
  
  const [tableContent,setTableContent] = useState("");
  const [linearContent, setLinearContent] = useState("");

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

          if(window.screen.availWidth>=700){
            var tableContent = [];
            for(let i=0;i<publicFiles.length;++i){
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
            setTableContent(tableContent);
          }else{
            var linearContent = [];
            for(let i=0;i<publicFiles.length;++i){
              linearContent.push(
                <div key={"linear"+publicFiles[i].metadata.shortname}>
                  <div className="container">
                      <div className="col-lg-4">
                          <div className="card card-margin">
                              <div className="card-header no-border">
                                  <h5 className="card-title">{publicFiles[i].metadata.shortname}</h5>
                              </div>
                              <div className="card-body pt-0">
                                  <div className="widget-49">
                                      <div className="widget-49-title-wrapper">
                                          <div className="widget-49-date-primary">
                                              { Math.round(((publicFiles[i].length/(1024*1024))*10))/10 === 0 ? 
                                                  Math.round(((publicFiles[i].length/(1024*1024))*100))/100 === 0 ?
                                                  (<><span className="widget-49-date-day">{Math.round(((publicFiles[i].length)*10))/10}</span>
                                                  <span className="widget-49-date-month">Byte</span></>) : 
                                                  (<><span className="widget-49-date-day">{Math.round(((publicFiles[i].length/(1024))*10))/10}</span>
                                                  <span className="widget-49-date-month">KB</span></>) :
                                                  (<><span className="widget-49-date-day">{Math.round(((publicFiles[i].length/(1024*1024))*10))/10}</span>
                                                  <span className="widget-49-date-month">MB</span></>) }
                                          </div>
                                          <div className="widget-49-meeting-info">
                                              <span className="widget-49-pro-title">{trimFileName(publicFiles[i].filename)}</span>
                                              <span className="widget-49-meeting-time">{formattedTime(publicFiles[i].metadata.expiryTime)}</span>
                                              <span className="widget-49-meeting-time">Download Left: {publicFiles[i].metadata.noOfDownload}</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                </div>          
              );
            }
            setLinearContent(linearContent);
          }

        } catch (error) {
          console.error("Error fetching public files:", error);
        }
      };
    
      fetchData();
    }, []);
    
    return (
        <div className="files">
          { (tableContent === "" && linearContent==="") ? ( <p>Public directory is loading...</p>) : 
            ( 
              <div>
                {window.screen.availWidth>=700 ? 
                <div className="table-responsive">
                  <table className="table table-hover" style={{"width":"100%", "minWidth":"660px"}}>
                    <thead>
                      <tr>
                        <td style={{"width":"10%"}}>File ID</td>
                        <td style={{"width":"30%"}}>File Name</td>
                        <td style={{"width":"10%"}}>Size</td>
                        <td style={{"width":"25%"}}>Expiry Time</td>
                        <td style={{"width":"15%"}}>Download Left</td>
                      </tr>
                    </thead>
                    <tbody>{tableContent}</tbody>
                  </table>
                </div>
                :
                <div>
                  {linearContent}
                </div>
              }
              </div>
            )
          }
        </div>
    );

}

export default PublicFiles;