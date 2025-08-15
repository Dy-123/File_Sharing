# File Sharing - Docker Overview

## Services
- **backend** – Node.js API (`6001`)
- **frontend** – React app (`3000`)
- **mongo** – MongoDB (`27017`)
- **localstack** – AWS S3 emulator (`4566`)
- **create-bucket** – Initializes S3 bucket `file-sharing-files`
- **mailhog** – SMTP sandbox (`1025`), Web UI (`8025`)

---

## Environment Variables
Enviroment variable for local docker setup is already set in `.env` .

---

## Running the Stack
```bash
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend (root route): [http://localhost:6001](http://localhost:6001)
- MailHog UI: [http://localhost:8025](http://localhost:8025)
- Check S3:  
  ```bash
  docker exec -it file_sharing-localstack-1 awslocal s3 ls
  ```

Note: All sent OTP can be viewed at MailHog WebUI.

---

## Stopping
```bash
docker-compose down
```
For a clean slate (removes volumes):
```bash
docker-compose down -v
```

---

## Testing
- **Email**: OTP emails appear in MailHog UI.
- **S3**: Upload/download files, verify in LocalStack S3 bucket.
- **MongoDB**: Accessible at `mongodb://localhost:27017/file_sharing`.