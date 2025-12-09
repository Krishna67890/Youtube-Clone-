# YouTube Clone Application

A fully responsive YouTube clone built with the MERN stack (MongoDB, Express.js, React, Node.js) with TypeScript.

## Features

- User authentication (login/signup)
- Video playback with YouTube embedding for select videos
- Video search functionality
- Responsive design for all device sizes
- Dark/light mode toggle
- Video recommendations
- User video uploads from PC and mobile devices
- Admin panel for content management

## Video Content

The application includes the following videos:

1. **Music Content**:
   - "Tu Hai Kahan" by Rauf & Faik
   - "12 Bande" by Divine
   - "Apa Fer Milaange" by Nawazishein
   - "Pal Pal Chainal | AFUSIC"
   - "Sidha Swami Kavach and chainal Suhasini Patil"
   - "Drama on Parts of Speech in English chainal Shubhangi Patil"
   - "Identify a Tense||How to read a tense? ||English Tense chainal Ajay English Word"

2. **Gaming Content**:
   - "MINECRAFT HARDCORE LAST EPISODE.... reason..... chainal Atharva Gamerz"
   - "Maha Mitra Mela 2025 trailer chainal Ajaysing Patil"
   - "Kanbai Visarjan Mahale parivar chainal ShivGauri's Universe"

3. **User-generated content**:
   - Users can upload their own videos through the upload form accessible via the hamburger menu on mobile or the upload button in the user menu on desktop.

## Technologies Used

- Frontend: React with TypeScript, CSS3, HTML5
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose ODM
- Authentication: JWT (JSON Web Tokens)
- State Management: Redux Toolkit
- Styling: Custom CSS with responsive design principles
- Deployment: Vercel (Frontend), Heroku (Backend)

## Setup Instructions

1. Clone the repository
2. Install dependencies for both frontend and backend:
   ```
   cd Frontend && npm install
   cd ../Backend && npm install
   ```
3. Create a `.env` file in the Backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the backend server:
   ```
   cd Backend && npm start
   ```
5. Start the frontend development server:
   ```
   cd Frontend && npm start
   ```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License.