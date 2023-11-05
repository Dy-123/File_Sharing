import { useEffect, useState } from "react";

function MyFiles(props){
  
  const [tableContent,setTableContent] = useState("");
  const [fileDeletedState,setFileDeletedState] = useState(false);
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
    if(typeof filename === 'string' && filename.length>20){
      return filename.slice(0, 10) + '...' + filename.slice(filename.length-10,filename.length) + '';
    }
    return filename;
  }

  useEffect(() => {

      const fetchData = async () => {
        try {

          const response = await fetch(process.env.REACT_APP_MY_FILES, { credentials: 'include' });

          const privateFiles = await response.json();
          privateFiles.reverse();

          if(window.screen.availWidth>=700){
            var tableContent = [];
            for(let i=0;i<privateFiles.length;++i){
              const params = new URLSearchParams();
              params.append("fileId",privateFiles[i].shortname);
              tableContent.push(
                <tr key={privateFiles[i].shortname}>
                  <td>{privateFiles[i].shortname}</td>
                  <td>{trimFileName(privateFiles[i].filename)}</td>
                  <td>
                    { Math.round(((privateFiles[i].size/(1024*1024))*10))/10 === 0 ? 
                    Math.round(((privateFiles[i].size/(1024*1024))*100))/100 === 0 ?
                    `${Math.round(((privateFiles[i].size)*10))/10} B` : 
                    `${Math.round(((privateFiles[i].size/(1024))*10))/10} KB` :
                    `${Math.round(((privateFiles[i].size/(1024*1024))*10))/10} MB` }
                  </td>
                  <td>{formattedTime(privateFiles[i].expiryTime)}</td>
                  <td>{privateFiles[i].noOfDownload}</td>
                  <td>{privateFiles[i].isPublic===true ? 'Yes' : 'No'}</td>
                  <td>{privateFiles[i].password==='' ? 'None' : privateFiles[i].password}</td>
                  <td>
                    <button style={{border: 'none', background:'transparent'}} onClick={async () => {await fetch(process.env.REACT_APP_DELETE+`?${params.toString()}`,{credentials: 'include'}); setFileDeletedState(!fileDeletedState);}}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            }
            setTableContent(tableContent);
          }else{
            var linearContent = [];
            for(let i=0;i<privateFiles.length;++i){
              const params = new URLSearchParams();
              params.append('fileId',privateFiles[i].shortname);
              linearContent.push(
              <div key={"linear"+privateFiles[i].shortname}>
                <div className="container">
                    <div className="col-lg-4">
                        <div className="card card-margin">
                            <div className="card-header no-border">
                                <h5 className="card-title">{privateFiles[i].shortname}</h5>
                            </div>
                            <div className="card-body pt-0">
                                <div className="widget-49">
                                    <div className="widget-49-title-wrapper">
                                        <div className="widget-49-date-primary">
                                            { Math.round(((privateFiles[i].size/(1024*1024))*10))/10 === 0 ? 
                                                Math.round(((privateFiles[i].size/(1024*1024))*100))/100 === 0 ?
                                                (<><span className="widget-49-date-day">{Math.round(((privateFiles[i].size)*10))/10}</span>
                                                <span className="widget-49-date-month">Byte</span></>) : 
                                                (<><span className="widget-49-date-day">{Math.round(((privateFiles[i].size/(1024))*10))/10}</span>
                                                <span className="widget-49-date-month">KB</span></>) :
                                                (<><span className="widget-49-date-day">{Math.round(((privateFiles[i].size/(1024*1024))*10))/10}</span>
                                                <span className="widget-49-date-month">MB</span></>) }
                                        </div>
                                        <div className="widget-49-meeting-info">
                                            <span className="widget-49-pro-title">{trimFileName(privateFiles[i].filename)}</span>
                                            <span className="widget-49-meeting-time">{formattedTime(privateFiles[i].expiryTime)}</span>
                                        </div>
                                    </div>
                                    <ul className="widget-49-meeting-points">
                                        <li className="widget-49-meeting-item"><span>Download Left: {privateFiles[i].noOfDownload}</span></li>
                                        <li className="widget-49-meeting-item"><span>Public File: {privateFiles[i].isPublic===true ? 'Yes' : 'No'}</span></li>
                                        <li className="widget-49-meeting-item"><span>Password: {privateFiles[i].password==='' ? 'None' : privateFiles[i].password}</span></li>
                                    </ul>
                                    <div className="widget-49-meeting-action">
                                        <button style={{border: 'none', background:'transparent'}} onClick={async () => {await fetch(process.env.REACT_APP_DELETE+`?${params.toString()}`,{credentials: 'include'}); setFileDeletedState(!fileDeletedState);}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                                              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                                            </svg>
                                        </button>
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
    }, [props.loginState,fileDeletedState]);

    const loggedInCheck = () => {
      if(document.cookie!==''){
        const cookieString = document.cookie;
        const cookies = cookieString.split(';');

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            const cookieName = cookie.split('=')[0];    // [cookieName, cookieValue] = cookie.split('=');

            if (cookieName === 'mail') {
                return true;
            }
        }
      }
      return false;
    }
    
    return (
      <div>
        {loggedInCheck() === true ?
          (<div className="files">
            { (tableContent === "" && linearContent==="") ? ( <p>Personal directory is loading...</p>) : 
              ( 
                <div>
                  {window.screen.availWidth >= 700 ?              
                    (<div className="table-responsive">
                      <table className="table table-hover">
                          <thead>
                            <tr>
                              <td style={{"width":"10%"}}>File id</td>
                              <td style={{"width":"25%"}}>File Name</td>
                              <td style={{"width":"10%"}}>Size</td>
                              <td style={{"width":"25%"}}>Expiry Time</td>
                              <td style={{"width":"15%"}}>Download Left</td>
                              <td style={{"width":"5%"}}>Public</td>
                              <td style={{"width":"10%"}}>Password</td>
                              <td></td>
                            </tr>
                          </thead>
                          { tableContent.length===0 ? <p className="empty-directory">Personal directory is empty.</p> : <tbody>{tableContent}</tbody>}
                        </table>
                      </div>)
                    :
                    (
                    <>
                      { linearContent.length===0 ? <p className="empty-directory">Personal directory is empty.</p> : <div>{linearContent}</div>}
                    </>
                    )
                  }
                </div>
              ) 
            }
          </div> ) :
          (<div className="files" style={{"display":"flex"}}><p>Log in to view your files.</p></div>)
        }        
      </div>
    );
}

export default MyFiles;