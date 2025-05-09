# Citizen-Science-App-for-Kids

This is a cross platform application consisting of an Admin Website and a Field App
The Field App is for K12 youth to select a project to collect field data and submit their observations
The Admin Website is for Educators to support the youth

# Project Setup and Run Instructions

## Requirements (for the field app)

-   Android SDK [https://developer.android.com/studio/](https://developer.android.com/studio/)

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

-   node.js
    -- expo
    -- REACT Native

## Running the React Native App (Mobile)

To run your project for NATIVE (Mobile), navigate to the directory and run one of the following npm commands.

-   cd frontend
-   cd citizen_science_app
-   npm run android
-   npm run ios # you need to use macOS to build the iOS project - use the Expo app if you need to do iOS development without a Mac
-   npm run web

## Running the React Web App (Admin Portal)

To run the web portion navigate to frontend/web-citizen_science
Web denotes that IT IS the react (not NATIVE) portion for the website admin page

-   cd frontend
-   cd web-citizen-science
-   npm install
-   npm start

## Running the Backend

Prerequisites
Make sure you have the following installed:

-   Python
-   MySQL server running locally or remotely
-   pip for installing Python packages

### 1. Set Up Environment Variables

Create a .env file in the backend/ directory using the .env.example file.

### 2. Create a Virtual Environment:

```
cd backend
python -m venv venv
source venv/bin/activate # On Windows use: venv\Scripts\activate
```

### 3. Install Dependencies

```
pip install -r requirements.txt
```

### 4. Start the individual services

In the backend folder and in separate terminals:

```
python3 ./api_gateway.py
python3 ./observations.py
python3 ./admin.py
python3 ./classrooms.py
python3 ./projects.py
python3 ./students.py students still not created
```

#### Alternatively, you can use the start_backend.sh file

You can do this by installing xterm
Ubantu:

```
sudo apt install xterm
```

Then from the Root directory:

Give start_backend.sh permission to run as an executable

```
chmod +x start_services.sh
```

Finally run the script:

```
./start_backend.sh
```
