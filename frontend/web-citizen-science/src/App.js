/* ------------ Main Routing ------------*/
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from "axios";
import { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react'

/* Routes */
import Navigation from './Components/Navigation.js';
import Homepage from './Components/Homepage.js';
import Landing from './Components/Landing.js';
import ViewProjects from './Components/ViewProjects.jsx'
import Admin from './Components/AdminPage.jsx'
import Classroom from './Components/ClassroomPage.jsx'
import Student from './Components/CreateStudent.jsx'
import Observation from './Components/CreateObservation.jsx';

/* Authentication Components */
import PrivateRoute from './Components/PrivateRoute';

/* ------------ Necessary Imports ------------*/
//* import { randomId } from '@mui/x-data-grid-generator'; <-- this is incompatiable with React Native :(
/*Import bootstrap styles */
import 'bootstrap/dist/css/bootstrap.min.css';
<a href="https://www.flaticon.com/free-icons/responsive-design" title="responsive design icons">Responsive design icons created by Freepik - Flaticon</a>

// Ensures cookie is sent
axios.defaults.withCredentials = true

function App() {
  return (
    <div className="App">
      <Router>
        <Navigation/>
        <Routes>
          <Route path = "/" element= {<Homepage />}/>
          <Route path = "/Landing" element= {<Landing />}/>
          <Route path = "/login" element= {<Landing />}/>
          <Route path = "/ViewProjects" element= {<ViewProjects />}/>
          <Route path = "/Admins" element= {<Admin />}/>
          <Route path = "/Classrooms" element= {<Classroom />}/>
          <Route path = "/CreateStudent" element= {<Student />}/>
          <Route path = "/CreateObservation" element= {<Observation />}/>
        </Routes>
      </Router>
      <footer>
        <p> &copy; 2025 McBarron, Pavelek, Messer & Ly</p>
        </footer>
    </div>
  );
}
export default App;
