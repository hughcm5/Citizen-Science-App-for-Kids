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

/* ------------ Projects Table ------------*/
function ViewProject() {
  const [project_id, setproject_id] = useState('');
  const [class_id, setclass_id] = useState('');
  const [project_title, setproject_title] = useState('');
  const [description, setdescription] = useState('');

    /* Prepare the retrieve on the frontend */
  const [projectData, setprojectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);

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
      fetchData(); // retreive 
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
    // Format the string to remove timezone 
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

/* ------------ Page Content  ------------*/
  return (
    <Container fluid>
      <Container className="content">
        <Row>
          <Col md={9}>
            <h1 style={{paddingBottom: '20px'}}>Projects Page</h1>
            <p>You can view the current Citizen Science Projects.</p>
            <h2>Current Projects:</h2>
            {
              // for debugging purposes
              // {JSON.stringify(projectData, null, 2)}
            }
            <br />
            { /* ------------ Project Table  ------------*/ }
            <table className="projectTable">
              <thead>
                <tr>
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
                  <td>{project.project_id}</td>
                  <td>{project.project_title}</td>
                  <td>{project.description}</td>
                  <td>{toHumanReadableDate(project.created_at)}</td>
                  <td>{toHumanReadableDate(project.updated_at)}</td>    
                </tr>
              ))}
              </tbody>
            </table>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default ViewProject
