import { useEffect, useState } from "react";

function MyFiles(props){
  
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

          const response = await fetch(process.env.REACT_APP_MY_FILES, { credentials: 'include' });

          const privateFiles = await response.json();
          privateFiles.reverse();

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
                <td>{privateFiles[i].metadata.isPublic===true ? 'Yes' : 'No'}</td>
                <td>{privateFiles[i].metadata.password==='' ? 'None' : privateFiles[i].metadata.password}</td>
              </tr>
            );
          }
          setTableContent(tableContent);
        } catch (error) {
          console.error("Error fetching public files:", error);
        }
      };
    
      fetchData();
    }, [props.loginState]);

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