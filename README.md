# File Sharing    
    
"File sharing" is a web app which let you share files via internet. In this we are using aws-s3 to store the files and mongodb to store data like file details, login user details/credentials etc. Files are download via fetch api and downloaded with XMLHttpRequest in small chunks/streams with the ability to trach download and upload progress.
Implemented features such as secure file upload/download with unique IDs, flexible sharing options (password protection,
download limit, file expiry time and public/private sharing), user-friendly file management, secure registration with
email OTP and login, and upload/download progress tracking.
       
Frontend: Reactjs, HTML, CSS    
Backend: Nodejs, Expressjs    
Database: Mongodb, aws-s3   

### Docker Image
Refer [DOCKER.md](https://github.com/Dy-123/File_Sharing/blob/master/DOCKER.md)

### GIF's and Screenshot    
**Wait for a few moments to load the GIF's.**

File Upload
![upload](https://github.com/Dy-123/File_Sharing/assets/54953527/51f740f1-4613-4a21-9845-95a14b27b0b1)

File Download
![download](https://github.com/Dy-123/File_Sharing/assets/54953527/fb85ab06-884d-4a9b-aabf-2bd3ab296e05)

Login
![login](https://github.com/Dy-123/File_Sharing/assets/54953527/036f162a-6dcf-469e-ae87-a9ba308e8b84)

Signup
![signup](https://github.com/Dy-123/File_Sharing/assets/54953527/57f4be29-a870-4a50-98cd-d5609525197b)

OTP Mail
![otp](https://github.com/Dy-123/File_Sharing/assets/54953527/496cfdf2-f093-4fff-aef2-6aba5226de79)

My Files : Large Screen(screen width>700px)
![myFiles](https://github.com/Dy-123/File_Sharing/assets/54953527/bb4a82d0-a9a3-4cea-b391-7b2a9a2e3401)

Public Files : Large Screen(screen width>700px)
![publicFiles](https://github.com/Dy-123/File_Sharing/assets/54953527/6280c2e1-ddca-4fa1-8f8a-9fb2b670ff7a)

My Files / Public Files : Small Screen(screen width<=700px)       
![mobileScreen](https://github.com/Dy-123/File_Sharing/assets/54953527/31803778-558d-476c-bf0a-f971e4b943c7)

Nodejs --version 18.16.1
