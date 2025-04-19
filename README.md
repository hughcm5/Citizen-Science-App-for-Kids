# Citizen-Science-App-for-Kids 

# Project Setup and Run Instructions

## Project Structure
frontend/
├── citizen_science_app/ # (mobile portion)
│ └── App.tsx # React Native homepage
|
└── web-citizen-science/ # React web app (admin portal)
│ ├── App.js # React main page for routing
| └── components/ # React components

## Dependencies :

This project requires multiple dependencies to build and execute:
  - node.js
    -- expo
    -- REACT Native
  - Android SDK (https://developer.android.com/studio)


## Running the React Native App (Mobile)

To run your project for NATIVE (Mobile), navigate to the directory and run one of the following npm commands.

- cd frontend
- cd citizen_science_app
- npm run android
- npm run ios # you need to use macOS to build the iOS project - use the Expo app if you need to do iOS development without a Mac
- npm run web


Running the React Web App (Admin Portal)

To run the web portion navigate to frontend/web-citizen_science
Web denotes that IT IS the react (not NATIVE) portion for the website admin page
- cd frontend
- cd web-citizen-science 
- npm install
- npm start