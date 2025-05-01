/* Create a New Project Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React from 'react'
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

/* ------------ Page Content  ------------*/
function Project() {
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
            <Form>
              <Form.Group className="mb-3" controlId="formBasicProjectName">
                  <Form.Label>Enter a name for this Project
                  :</Form.Label>
                  <Form.Control type="name" maxLength='15' placeholder="Enter a Project Name" name="name" required />
                </Form.Group>
                <Form.Text className="text-muted"></Form.Text>
              <Button variant="primary" type="submit">
                Create New Project
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default Project
