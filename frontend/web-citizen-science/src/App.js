/* ------------ Main Routing ------------*/

import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

/* Routes */
import Navigation from './Components/Navigation.js';
import Homepage from './Components/Homepage.js';
import CreateProject from './Components/CreateProject.js';
import Landing from './Components/Landing.js';
import ViewProjects from './Components/ViewProjects.js'
import EditProjects from './Components/ViewProjects.js'

/* ------------ Necessary Imports ------------*/
import axios from "axios";
//* import { randomId } from '@mui/x-data-grid-generator'; <-- NOT cooperating! >:(
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
          <Route path = "/createproject" element= {<CreateProject />}/>
          <Route path = "/Landing" element= {<Landing />}/>
          <Route path = "/ViewProjects" element= {<ViewProjects/>}/>
          <Route path="/EditProjects" element={<EditProjects getRows={getRows} getCol={getCol} />} />
        </Routes>
      </Router>
      <footer>
            <p> &copy; 2025 McBarron, Pavelek, Messer & Ly</p>
        </footer>
    </div>
  );
}
export default App;
