import React from 'react'

/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { createContext } from 'react';
/* reading up about createContext - should let frontend pass information to backend */

function Project() {
  return (
    <section>
      <Container fluid>
        <Container className="create-project">
          <Row>
            <Col md={9}>
            <h1>
              Citizen science projects are activities so K-12 students can 
              meaningfully contribute to scientific research
            </h1>

            <h3> Please enter a project code below: </h3>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="name" placeholder="Full Name" name="name" required />
              </Form.Group>
            </Form>
            <Button>Submit</Button> {/* onClick send form data to back end to create a new project */}
          </Col>
        </Row>
      </Container>
    </Container>
    </section>
  )
}

export default Project
