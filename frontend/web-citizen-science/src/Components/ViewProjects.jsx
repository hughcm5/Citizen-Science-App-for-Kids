/* Project Page on the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState, useEffect } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from "axios";
import Classroom from './ClassroomPage';

/* ------------ Functions for Projects Page ------------*/
function ViewProject() {
  /* values to match Models.py and Projects Microservice for the payload */
  const [project_id, setproject_id] = useState('');
  const [class_id, setclass_id] = useState('');
  const [project_title, setproject_title] = useState('');
  const [description, setdescription] = useState('');
    /* Prepare the retrieve on the frontend */
  const [projectData, setprojectData] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectResults, setSelectedProjectResults] = useState([]);
  const [retrieveError, setRetrieveError] = useState(null);
  /* Prepare to edit on the frontend */
  const [editedId, setEditedId] = useState(null);
  const [editedProjectData, setEditedProjectData] = useState({});
  /* allow user to download CSVfile */
  const [CSVfile, setCSVfile] = useState(''); 
  const [CSVdownload, setCSVdownload] = useState('');

/* ------------ Create ------------*/
  const handleSubmit = (event) => {
    event.preventDefault();
    const project_payload = {
      project_id,
      class_id,
      project_title,
      description
    }
    console.log('project:', ViewProject);
    axios.post(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/projects', project_payload)
    .then((response) => {
      console.log('Project creation successful');
      fetchData(); // repopulate table with new project 
    })
    .catch((err) => {
      console.log('Failed to create this project');
      if (err.data) {
        console.log(JSON.stringify(err.data));
      }
    });
  };
  const toHumanReadableDate = (backendDateStr) => {
    const date = new Date(backendDateStr);
    // Format the string to remove timezone and timestamp 
    return date.toISOString().split('T')[0];
  }

/* ------------ Retrieve ------------*/
  const fetchData = async () => {
    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/projects')
      .then((response) => {
        console.log('Fetched projects successfully');
        console.log(response);
        const projectData = response.data
        setprojectData(projectData);
        // Set default selected project if null
        if (!selectedProjectId) {
          setSelectedProjectId(projectData[0].project_id);
        } else {
          // If it is already selected, make sure it exists
          const existingProject = projectData.find(e => e.project_id === selectedProjectId);
          // Else, just select the first one by default
          if (!existingProject) {
            setSelectedProjectId(projectData[0].project_id);
          }
        }

        
      })
      .catch((err) => {
        console.error('Failed to retrieve projects');
        console.error(err);
      });

  };

  const fetchClassrooms = async () => {
    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/classrooms')
      .then((response) => {
        console.log('Fetched classrooms successfully');
        setClassrooms(response.data);
      })
      .catch((err) => {
        console.error('Failed to retrieve classrooms');
        console.error(err);
      });
  }

  useEffect(() => {
    fetchData();
    fetchClassrooms();
  }, []);

  /* ------------ Update ------------*/
  const onEditRow = (project) => {
    // enables editing by matching a selected id and renders input fields
    setEditedId(project.project_id);
    setEditedProjectData(project);
  }
  const onEditChange = (x) => {
    const { name, value } = x.target;
    setEditedProjectData({...editedProjectData, [name]:value});
  }
  const cancelEdit = () => {
    setEditedId(null);
    setEditedProjectData({});
  }
  const onSaveEdit = async () => {
    if (!editedId) {
      // do nothing if no edits were made
      return;
    }
    // TODO frontend validation to catch mistakes before sending updates to backend
    const project_payload = {
      // if edits exist, then package the payload to send to the backend
      'project_id' : editedProjectData.project_id, // send ALL necessary components that match the microservice for PUT
      'class_id': editedProjectData.class_id,
      'project_title': editedProjectData.project_title,
      'description': editedProjectData.description,
      'project_settings' : editedProjectData.project_settings
    };
    // TODO: Add some feedback for the user to know that edits are being saved
    try {
      const response = await axios.put(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/projects/' + editedProjectData.project_id.toString(), project_payload);
      console.log('Project updated successfully', response.data);
      // handle update
      const project_to_be_updated = projectData.find(obj => obj.project_id === editedProjectData.project_id);
      if (project_to_be_updated) {
        project_to_be_updated.project_title = editedProjectData.project_title;
        project_to_be_updated.description = editedProjectData.description;
      }
      fetchData()
      // refresh the table (just in case multiple edits were made at once)
      cancelEdit(); // exit edit mode: disables edit fields 
      // TODO let user know edits were successful
    } catch (error) {
      console.error('Error updating project: ', error); // error handling
      // TODO autocancel or leave editing mode
      cancelEdit();
      // TODO tell user stuff went wrong and what went wrong
    }
  }
/* ------------ Results ------------*/
  
  const fetchSelectedProject = async () => {
    if (!selectedProjectId) {
      // TODO: Make an error message show
      console.log("A project ID is required");
      return;
    }

    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/projects/' + selectedProjectId.toString() + '/results')
      .then((response) => {
        console.log('Successfully fetched project details');
        const project_details = response.data;
        console.log(project_details);
        setSelectedProjectResults(project_details);
      })
      .catch((err) => {
        console.error('Failed to fetch project data');
        console.error(err);
      });
  }
/* ------------ Delete  ------------*/
  const deleteProject = async (id) => {
    try {
      const response = await axios.delete(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/projects/' + id.toString());
      console.log('Project deleted successfully', response.data)
      // handle success by refreshing table
      fetchData();
    } catch (error) {
      console.error('Error deleting project:', error); // error handling
    }
};
/* ------------ CSV ------------*/
  const fetchCSV = async () => {
    if (!selectedProjectId) {
      // TODO: Make an error message show
      console.log("A project ID is required");
      return;
    }

    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/projects/' + selectedProjectId.toString() + '/csv')
      .then((response) => {
        console.log('CSV ready to be downloaded');
        const csvData = response.data;
        console.log(response);

        // Get project name from data cache
        const project = projectData.find(e => e.project_id === selectedProjectId);
        const projectName = project ? project.project_title : "project"
        const filename = projectName + ".csv";

        // Create local file from fetched backend
        const file = new File([csvData], filename, {
          type: "text/csv",
        });
        const urlObj = URL.createObjectURL(file);

        // Wierd hack to get downloads working with filenames
        const link = document.createElement("a");
        link.href = urlObj;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch((err) => {
        console.error('Failed to retrieve CSV file data');
        console.error(err);
      });
  };

/* ------------ Page Content  ------------*/
  return (
    <Container fluid>
      <Container className="content">
        <Row>
          <Col md={9}>
            <h1 style={{paddingBottom: '10px'}}>Projects Page</h1>
            <p>Citizen science projects are activities so K-12 students can 
              meaningfully contribute to scientific research <br />
              <br /></p>
            <h2>Active Projects:</h2>
            {
              // for debugging purposes
              // {JSON.stringify(projectData, null, 2)}
            }
            <p>You can view the current Citizen Science Projects.</p>
            { /* ------------ Project Table  ------------*/ }
            <table className="projectTable">
              <thead>
                <tr>
                  <th> </th>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th> </th>
                </tr>
              </thead>
              <tbody>
              {projectData.map(project => (
                <tr key={project.project_id}>
                  <td>
                    {
                      editedId === project.project_id ? (<>
                            <button onClick={() => cancelEdit()}>Cancel</button>
                            <button onClick={() => onSaveEdit()}>Save</button>
                            </>)
                          : (<button onClick={() => onEditRow(project)}>Edit</button>)
                        }
                  </td>
                  <td>{project.project_id}</td>
                  <td>{
                  editedId === project.project_id ? (<input name="project_title" type="text" value={editedProjectData.project_title} onChange={onEditChange}/>) : (project.project_title)
                  }</td>
                  <td>{
                  editedId === project.project_id ? (<input name="description" type="text" value={editedProjectData.description} onChange={onEditChange}/>) : (project.description)
                  }</td>
                  <td>{toHumanReadableDate(project.created_at)}</td>
                  <td>{toHumanReadableDate(project.updated_at)}</td>    
                  <td><button onClick={(e) => deleteProject(project.project_id)}>Delete</button></td>
                </tr>
              ))}
              </tbody>
            </table>
            <br />
          { /* ------------ Project Results  ------------*/ }
          <h2>Project Results</h2>
          <p>Select a Project to View its results:</p>
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
          >
            {projectData.map(project => (
              <option value={project.project_id}>{project.project_title + ' (' + project.project_id.toString() + ')'}</option>
            ))}
          </select>
          <button onClick={fetchSelectedProject}>See Results</button>
           <br />
            {
              // for debugging purposes
              JSON.stringify(selectedProjectResults, null, 2)
            }
          <table className="resultsTable">
          { /* ------------ TODO Display Results  ------------*/ }
            <thead>
              <tr>
                <th>Project Details</th>
                <th>field_data_stats</th>
                <th>observations</th>
                <th>stats</th>
              </tr>
            </thead>
            <tbody>
              {projectData.map(project => (
                <tr key={project.project_id}>

                </tr>
              ))}
            </tbody>
          </table>
          <p> Download Project Data</p>
          { /* ------------ Show CSV File  ------------*/ }
          <p>  </p>
          { /* ------------ Allow user to download CSV File  ------------*/ }
          <button onClick={fetchCSV}> Download CSV </button> <br />
          { /* ------------ Create a Project ------------*/ }
            <h2> Create Project </h2>
            <p>Enter the project details to create a new project.</p>
            { /* ------------ Selection for Class ID ------------*/ }
            <form onSubmit={handleSubmit}>
              <label> 
              <select
            value={class_id}
            onChange={e => setclass_id(e.target.value)}
            >
            {classrooms.map(classroom => (
              <option value={classroom.class_id}>{classroom.class_name + ' (' + classroom.class_id + ')'}</option>
            ))}
              </select>
              <input type="text" placeholder="Title" value={project_title} onChange={(e) => setproject_title(e.target.value)} />
              <input type="textfield" placeholder="describe the project for the students" value={description} onChange={(e) => setdescription(e.target.value)} />
              </label>
              <br />
              <Button variant="primary" type="submit">Submit</Button>
            </form>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default ViewProject
