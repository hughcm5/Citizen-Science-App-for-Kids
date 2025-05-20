/* Create a New Project : Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import axios from "axios";

/* ------------ Page Content  ------------*/
function Project() {
  const [class_id, setclass_id] = useState('');
  const [project_title, setproject_title] = useState('');
  const [description, setdescription] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const project_data = {
      class_id,
      project_title,
      description
    }
    console.log('project_title:', project_title);
    axios
      .post("http://localhost:5001/projects", project_data)
      .then((response) => {
        console.log('Project post successful');
      })
      .catch((err) => {
        console.log('Failed to post project');
        if (err.data) {
          console.log(JSON.stringify(err.data));
        }
      });
  };

  return (
    <Container fluid>
      <Container className="content">
        <Row>
          <Col md={9}>
            <h1 style={{paddingBottom: '40px'}}>
              Citizen science projects are activities so K-12 students can 
              meaningfully contribute to scientific research
            </h1>
            <h2> You can create a new project: </h2>
              
            <form onSubmit={handleSubmit}>
              <label>
              Create a new Project - Enter the Project Details:
              <input type="number" placeholder="5 digit number" value={class_id} onChange={(e) => setclass_id(e.target.value)} />
              <input type="text" placeholder="Title" value={project_title} onChange={(e) => setproject_title(e.target.value)} />
              <input type="textfield" placeholder="describe the project for the students" value={description} onChange={(e) => setdescription(e.target.value)} />
              </label>
              <Button variant="primary" type="submit">Submit</Button>
            </form>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default Project
