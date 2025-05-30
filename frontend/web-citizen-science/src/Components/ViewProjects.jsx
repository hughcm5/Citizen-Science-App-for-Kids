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

/* ------------ Functions for Projects Page ------------*/
function ViewProject() {
  /* values to match Models.py and Projects Microservice for the payload */
  const [project_id, setproject_id] = useState('');
  const [class_id, setclass_id] = useState('');
  const [project_title, setproject_title] = useState('');
  const [description, setdescription] = useState('');
    /* Prepare the retrieve on the frontend */
  const [projectData, setprojectData] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState([]);
  const [selectedProjectResults, setSelectedProjectResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);
  /* Prepare to edit on the frontend */
  const [editedId, setEditedId] = useState(null);
  const [editedProjectData, setEditedProjectData] = useState({});


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
    axios.post("http://localhost:5000/projects", project_payload)
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
      try {
        const response = await axios.get('http://localhost:5000/projects');
        setprojectData(response.data);
        setLoading(false);
      } catch (err) {
        setRetrieveError(err)
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchData();
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
      const response = await axios.put(`http://localhost:5000/projects/` + editedProjectData.project_id.toString(), project_payload);
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
  const fetchResults = async () => {
    console.log("Fetching");
      try {
        const response = await axios.get('http://localhost:5000/projects/'+ project_id.toString() + '/results');
        setprojectData(response.data);
        setLoading(false);
      } catch (err) {
        setRetrieveError(err)
        setLoading(false);
      }
    };
  
  const fetchSelectedProject = async () => {
    if (!selectedProjectId) {
      // TODO: Make an error message show
      console.log("A project ID is required");
      return;
    }

    axios
      .get('http://localhost:5000/projects/'+ selectedProjectId.toString() + '/results')
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
          
          { /* ------------ Allow user to download CSV File  ------------*/ }

          { /* ------------ Create a Project ------------*/ }
            <h2> Create Project </h2>
            <p>Enter the project details to create a new project.</p>
            { /* ------------ TODO: Selection for Class ID ------------*/ }
            <form onSubmit={handleSubmit}>
              <label> 
              <input type="number" placeholder="(Existing) Class ID" value={class_id} onChange={(e) => setclass_id(e.target.value)} />
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
