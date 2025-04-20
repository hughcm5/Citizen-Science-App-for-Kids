import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


/* Routes */
import Navigation from './Components/Navigation.js';
import Homepage from './Components/Homepage.js';
import CreateProject from './Components/CreateProject.js';
import Landing from './Components/Landing.js';


/*Import bootstrap styles */
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <div className="App">
      <Router>
        <Navigation/>
        <Routes>
          <Route path = "/" element= {<Homepage />}/>
          <Route path = "/createproject" element= {<CreateProject />}/>
          <Route path = "/Landing" element= {<Landing />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
