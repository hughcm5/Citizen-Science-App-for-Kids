# Citizen-Science-App-for-Kids

This is a cross platform application consisting of an Admin Website and a Field App
The Field App is for K12 youth to select a project to collect field data and submit their observations.
The Admin Website is for Educators to support the youth

# Project Setup and Run Instructions

Frontend: The frontend requires usage of Android SDK and React/React-Native to function. To render the field app on react native, we made usage of an Android SDK
emulator to display the field app.

## Requirements (for the field app)

-   Android SDK [https://developer.android.com/studio/](https://developer.android.com/studio/)

-   React Native (How it works with Android SDK Studio) [https://reactnative.dev/docs/set-up-your-environment](https://reactnative.dev/docs/set-up-your-environment)

## Project Structure

<pre>
frontend/
├── <b>citizen_science_app/</b>        # Field App (React Native)
│   ├── app                            # React Native entry point
│   │   └── tabs/components/           # Navigation tabs for componentrs
│                
│
└── <b>web-citizen-science/</b>        # Web admin portal (React)
    ├── App.js                         # Main page for routing (navigation in app)
    └── components/                    # React components

backend/                               # Backend server (Flask)
├── app.py                             # Main Flask application
├── db/                                # Flask routes for database tables
│   ├── observations.py                # Observation routes
│   ├── projects.py                    # Project routes
│   └── users.py                       # User routes
└── models/                            # SQLAlchemy models
    └── model.py                       # Database models (tables)
</pre>

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

## ChatGPT Endpoint (Mobile)

When the user uses the endpoint at (https://api.openai.com/v1/chat/completions), you
are charged based on tokens, not requests. Tokens charged are based on the length
of the prompt you give it. For example, if your request is "Write some questions on this ladybug project", thats about 7 words, or a few tokens.  

For this project, we wanted to automatically generate observations questions dynamically for every different project description, ensuring questions are customized
for each project. As for the prompts used, they are located in the "content" attribute, and have to be fed very specific responses over trial-and-error to get the 
intended result. The snippets pass the description (project description) as a 
prompt into the endpoint, and then questions are rendered and shopwn to the user
based on the description sent.


```js
content: `Generate student observation questions (should be different questions every time request is sent) for ${description} project; they must be simple enough for a child to understand`,
```


```js
content: `Generate one student observation question (should be a different question and answers every tiome this request) for ${description} project and include a list of checkbox option answers for that question; they must be simple enough for a child to understand, Output ONLY the JavaScript array, do not incldue any explanation, introductory words or text, only the array literal, output it exactly like this example but think of a different question and answers {
  "question": "What do you think ladybugs do to help plants?",
  "options": [
    "Eat bad bugs",
    "Make plants grow",
    "Drink water from flowers",
    "Make friends with other insects"
  ]
} `
```


```js
content: `Generate dropdown menu options (should be a different question and answers every time this request) for ${description} project,they must be simple enough for a child to understand, Output ONLY the JavaScript array, do not incldue any explanation, introductory words or text, only the array literal, output it exactly like this example but think of a different question and answers example (do not use this this is an example) ["What do ladybugs eat?", "How do ladybugs protect plants?", "Where do ladybugs live?"]`
```


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
```

```
python3 ./observations.py
```

```
python3 ./admin.py
```

```
python3 ./classrooms.py
```

```
python3 ./projects.py
```

```
python3 ./students.py <- students still not created
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
