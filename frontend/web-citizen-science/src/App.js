/* ------------ Main Routing ------------*/

import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

/* Routes */
import Navigation from './Components/Navigation.js';
import Homepage from './Components/Homepage.js';
import CreateProject from './Components/CreateProject.jsx';
import Landing from './Components/Landing.js';
import ViewProjects from './Components/ViewProjects.jsx'
import Admin from './Components/AdminPage.jsx'
import Classroom from './Components/CreateClassroom.jsx'
import Student from './Components/CreateStudent.jsx'
import Observation from './Components/CreateObservation.jsx';

/* ------------ Necessary Imports ------------*/
import axios from "axios";
//* import { randomId } from '@mui/x-data-grid-generator'; <-- this is incompatiable with React Native :(
/*Import bootstrap styles */
import 'bootstrap/dist/css/bootstrap.min.css';

const getRows = async (path) => {
  try {
  const res = await axios.get(process.env.REACT_APP_API_URL + path);
  const rows = res.data;
  /* o is the object and i is its corresponding index */
  rows.map((o, i) => o.id = i.id());
  return rows;
  }
  catch (error) {
    alert(`READ: Failed request to server. Status code: ${error.response.status}
      See http resonse for more information.`)
      return 1;
  }
}

/* Retrieve data to populate the columns */
const getCol = async (path) => {
  /* Seperate the key value pair by seperating its path */
  const column = path.split('/').at(-1);
  try {
    const res = await axios.get(process.env.REACT_APP_API_URL + path);
    const vals = res.data;
    return vals.map((o) => o[column]);
  }
  catch (error) {
    alert(`READ: Failed request to server. Status code: ${error.response.status}
          See http resonse for more information.`);
    return 1;
  }
}

function App() {
  return (
    <div className="App">
      <Router>
        <Navigation/>
        <Routes>
          {/* Pass getRows and getCol to each page using DataTable */}
          <Route path = "/" element= {<Homepage />}/>
          <Route path = "/createproject" element= {<CreateProject getRows={getRows} getCol={getCol}/>}/>
          <Route path = "/Landing" element= {<Landing />}/>
          <Route path = "/ViewProjects" element= {<ViewProjects/>}/>
          <Route path = "/CreateAdmins" element= {<Admin/>}/>
          <Route path = "/CreateClassroom" element= {<Classroom/>}/>
          <Route path = "/CreateStudent" element= {<Student/>}/>
          <Route path = "/CreateObservation" element= {<Observation/>}/>

        </Routes>
      </Router>
      <footer>
            <p> &copy; 2025 McBarron, Pavelek, Messer & Ly</p>
        </footer>
    </div>
  );
}
export default App;
