/* Landing aka Log-In Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React from 'react'
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { createContext } from 'react';

/* ------------ Page Content  ------------*/
function Landing() {
    return (
      <section>
        <Container fluid>
          <Container className="pagecontent">
            <Row>
              <Col md={9}>
              <h1>
                Please log in:
              </h1>
  
              <h3> Enter your Username & Password </h3>
              <Form>
                <Form.Group className="mb-3" controlId="formusername">
                  <Form.Label>Username:</Form.Label>
                  <Form.Control type="name" placeholder="Enter your Username" name="name" required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formpassword">
                  <Form.Label>Password:</Form.Label>
                  <Form.Control type="password" placeholder="Enter your Password" name="password" required />
                </Form.Group>
              </Form>
              <Button>Submit</Button> {/* onClick send form data to back end to create a new project */}
              { /** Consider useState to contain data from remote server and to contain form data */ }
              { /* Load the page with buttons that allow Admin to Add New Project or View Current Projects after login */ }
              { /* If current projects is selected, then populate with the existing projects from the remote source */ }
            </Col>
          </Row>
        </Container>
      </Container>
      </section>
    )
  }
  export default Landing