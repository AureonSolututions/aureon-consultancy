AUREON BACKEND SETUP

1. Open this folder in Visual Studio Code.
2. Open the terminal in the backend folder.
3. Run:
   npm install

4. Copy .env.example to .env.
5. Open .env and change:
   JWT_SECRET
   ADMIN_PASSWORD

6. Start the server:
   npm start

7. Open:
   http://localhost:3000
   http://localhost:3000/admin
   http://localhost:3000/api/status

The database is created automatically in backend/data/aureon.db.

The location fields are prepared for geolocation integration. During local
development they will show Unknown until a production geolocation service
is connected.
