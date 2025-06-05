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
  const [selectedProjectResults, setSelectedProjectResults] = useState(null);
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
      const msg = 'Project creation successful';
      console.log(msg, ': ', response?.data);
      window.alert(msg);
      fetchData(); // repopulate table with new project 
    })
    .catch((err) => {
      const msg = 'Failed to create this project';
      console.log(msg, ': ', err);
      window.alert(msg);
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
        const classrooms = response.data
        setClassrooms(response.data);

        // Set default selected classroom if null
        if (class_id === null || class_id === '') {
          setclass_id(classrooms[0].class_id);
        } else {
          // If it is already selected, make sure it exists
          const existingClass= classrooms.find(e => e.class_id === class_id);
          // Else, just select the first one by default
          if (!existingClass) {
            setclass_id(classrooms[0].class_id);
          }
        }
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
      const msg = 'Project updated successfully';
      console.log(msg, ': ', response?.data);
      window.alert(msg);
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
      const msg = 'Error updating project';
      console.error(msg, ': ', error);
      window.alert(msg);
      // TODO autocancel or leave editing mode
      cancelEdit();
      // TODO tell user stuff went wrong and what went wrong
    }
  }
/* ------------ Results ------------*/
  
  const fetchSelectedProject = async () => {
    if (!selectedProjectId) {
      const msg = 'A project ID is required. Please use the drop down select';
      console.log(msg);
      window.alert(msg);
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
      const msg = 'Project deleted successfully';
      console.log(msg, ': ', response?.data);
      window.alert(msg);
      // handle success by refreshing table
      fetchData();
    } catch (error) {
      const msg = 'Error deleting project';
      console.log(msg, ': ', error);
      window.alert(msg);
    }
};
/* ------------ CSV ------------*/
  const fetchCSV = async () => {
    if (!selectedProjectId) {
      const msg = 'A project ID is required. Please use the drop down select';
      console.log(msg);
      window.alert(msg);
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

/* ------------ Table Styling ------------*/
  var tableStyle = {
       "border": "1px solid black",
    };
  var column = {
      padding: '10px',
      "border-bottom": "1px solid black"
    };

/* ------------ Page Content  ------------*/
  return (
    <Container fluid>
      <Container className="content">
        <h1 style={{
        fontSize: '50px', padding:'1.5%', color:'black', filter: 'drop-shadow(2px 2px 1px blue)'}} > Projects Page</h1>
          <Row style={{
          backgroundColor:'#86adde80', borderRadius: '10px',    
                }}>
            <Col md={9}>
              <p style={{fontSize:'20px', margin:'1%'}}>Citizen science projects are activities so K-12 students can engage with scientific research as a class.<br />
              <br /></p>
            <h2>Active Projects:</h2>
            {
              // for debugging purposes
              // {JSON.stringify(projectData, null, 2)}
            }
            <p>You can view the current Citizen Science Projects.</p>
            { /* ------------ Project Table  ------------*/ }
            <table className="projectTable" style={tableStyle}>
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
          
          { /* ------------ Create a Project ------------*/ }
            <h2> Create Project </h2>
            <p>Enter the project details to create a new project.</p>
            { /* ------------ Selection for Class ID ------------*/ }
            <form onSubmit={handleSubmit} style={tableStyle}>
              <label>  <br />
              <select
            value={class_id}
            onChange={e => setclass_id(e.target.value)}
            >
            {classrooms.map(classroom => (
              <option value={classroom.class_id}>{classroom.class_name + ' (' + classroom.class_id + ')'}</option>
            ))}
              </select><br />
              <input type="text" placeholder="Title" value={project_title} onChange={(e) => setproject_title(e.target.value)} />
              <input type="textfield" placeholder="describe the project for the students" value={description} onChange={(e) => setdescription(e.target.value)} />
              </label>
              <br />
              <Button variant="primary" type="submit">Submit</Button>
            </form>
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
           <br /><br />
            { /*
              // for debugging purposes
              JSON.stringify(selectedProjectResults, null, 2)
            }

          { /* Project description table */ }
          <p>Project Details</p>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Class (Class ID)</th>
                <th>Project Title (Project ID)</th>
                <th>Project Description</th>
              </tr>
            </thead>
            <tbody>
              {
                selectedProjectResults !== null && (
                  <tr>
                    <td>{selectedProjectResults.project.class_id}</td>
                    <td>{selectedProjectResults.project.project_title + ' (' + selectedProjectResults.project.project_id + ')' }</td>
                    <td>{selectedProjectResults.project.description}</td>
                  </tr>
                )
              }
            </tbody>
          </table>

          { /* Project stats table */ }
          <p>Project Statistics</p>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Total Observations</th>
                <th>Total Students</th>
                <th>Students with Observations</th>
                <th>Students without Observations</th>
                <th>Completion %</th>
                <th>Average Observations per Student</th>
                <th>Average Observations per Student with Observations</th>
              </tr>
            </thead>
            <tbody>
              {
                selectedProjectResults !== null && (
                  <tr>
                    <td>{selectedProjectResults.stats.total_observations}</td>
                    <td>{selectedProjectResults.stats.total_students}</td>
                    <td>{selectedProjectResults.stats.students_with_observations}</td>
                    <td>{selectedProjectResults.stats.students_without_observations}</td>
                    <td>{selectedProjectResults.stats.completion_percentage}</td>
                    <td>{selectedProjectResults.stats.average_observations_per_student}</td>
                    <td>{selectedProjectResults.stats.average_observations_per_student_with_observations}</td>
                  </tr>
                )
              }
            </tbody>
          </table>
          <p>Student Activity</p>
          { /* students with observations table */ }
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Students with Observations (last name, first (student ID))</th>
              </tr>
            </thead>
            <tbody>
              {
                selectedProjectResults !== null && selectedProjectResults.students_with_observations.map(student => (
                  <tr>
                    <td>{student.last_name + ', ' + student.first_name + ' (' + student.student_id + ')'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <p>Inactive Students</p>
          { /* students without observations table */ }
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Students without Observations (last name, first (student ID))</th>
              </tr>
            </thead>
            <tbody>
              {
                selectedProjectResults !== null && selectedProjectResults.students_without_observations.map(student => (
                  <tr>
                    <td>{student.last_name + ', ' + student.first_name + ' (' + student.student_id + ')'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
           <br />

          <p> Download Project Data</p>
          { /* ------------ Show CSV File  ------------*/ }
          <p>  </p>
          { /* ------------ Allow user to download CSV File  ------------*/ }
          <button onClick={fetchCSV}> Download CSV </button> <br /><br />
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default ViewProject
