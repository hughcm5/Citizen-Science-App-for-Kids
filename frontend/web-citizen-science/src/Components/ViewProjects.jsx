/* View Project Pages on the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import axios from "axios";

/* ------------ import axios from "axios";  ------------*/
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

/* ------------ Page Content  ------------*/
function ViewProject() {
  const [project_id] = useState('');
  const [class_id] = useState('');
  const [project_title] = useState('');
  const [description] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
    const project_data = {
      project_id,
      class_id,
      project_title,
      description
    }
    console.log('project_title:', project_title);
    axios
      .post("http://localhost:5000/projects", project_data)
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
              You can view a collection of Citizen science projects.
            </h1>
            <h2> Enter a project code to view its contents: </h2>
              
           <Form>
              <Form.Group className="mb-3" controlId="formBasicProjectCode">
                <Form.Control 
                  type="name" 
                  maxLength='5'
                  pattern= "\d{5}"
                  required 
                />
                <Form.Text className="text-muted">
                  Enter a 5-digit project code
                </Form.Text>
              </Form.Group>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default ViewProject
