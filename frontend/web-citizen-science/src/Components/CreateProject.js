import React from 'react'

/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

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

            <h6> Please enter a project code below: </h6>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicProjectCode">
                <Form.Control 
                  type="name" 
                  maxLength='5'
                  pattern= "\d{5}"
                  required 
                />
                <Form.Text className="text-muted">
                  Enter a 5-digit project code.
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

export default Project
