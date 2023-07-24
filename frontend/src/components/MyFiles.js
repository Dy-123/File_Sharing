import { useEffect, useState } from "react";

function MyFiles(props){
  
  const [tableContent,setTableContent] = useState("");
  const [fileDeletedState,setFileDeletedState] = useState(false);

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

          const response = await fetch(process.env.REACT_APP_MY_FILES, { credentials: 'include' });

          const privateFiles = await response.json();
          privateFiles.reverse();

          var tableContent = [];
          for(var i=0;i<privateFiles.length;++i){
            const params = new URLSearchParams();
            params.append("fileId",privateFiles[i].metadata.shortname);
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
                <td>{privateFiles[i].metadata.isPublic===true ? 'Yes' : 'No'}</td>
                <td>{privateFiles[i].metadata.password==='' ? 'None' : privateFiles[i].metadata.password}</td>
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
        (<div className="privateFiles">
          { tableContent === "" ? ( <p>Personal directory is loading...</p>) : 
            ( <table className="table table-hover">
              <thead>
                <tr>
                  <td>File id</td>
                  <td>File Name</td>
                  <td>Size</td>
                  <td>Expiry Time</td>
                  <td>Download<br/> Left</td>
                  <td>Public</td>
                  <td>Password</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>{tableContent}</tbody>
            </table> ) 
          }
        </div>) :
        (<div className="privateFiles"><p>Log in to view your files.</p></div>)}
        
      </div>
        
    );

}

export default MyFiles;