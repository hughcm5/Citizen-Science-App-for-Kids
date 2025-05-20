/* Landing aka Log-In Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import axios from "axios";

/* ------------ Page Content  ------------*/
function Landing() {
  const [CLIENT_ID, setCLIENT_ID] = useState('')
  const [CLIENT_SECRET, setCLIENT_SECRET] = useState('')

    const handleSubmit = (event) => {
    event.preventDefault();
    const oauth_data = {
      CLIENT_ID,
      CLIENT_SECRET,
    }
    console.log('oauth_data:', oauth_data);
    axios
      .post("http://localhost:5000/oauth/callback", oauth_data)
      .then((response) => {
        console.log('Login successful');
      })
      .catch((err) => {
        console.log('Failed to log in');
        if (err.data) {
          console.log(JSON.stringify(err.data));
        }
      });
  };

    return (
      <section>
        <Container fluid>
          <Container className="pagecontent">
            <Row>
              <Col md={9}>
              <h1>
                Please log in:
              </h1>
  
              <h3> Enter your Email & Password </h3>
            <form onSubmit={handleSubmit}>
              <input type="email" placeholder="Enter your Google Email" value={CLIENT_ID} onChange={ (e)=> setCLIENT_ID} />
              <input type="text" placeholder="Password: " value={CLIENT_SECRET} onChange={(e) => setCLIENT_SECRET(e.target.value)} />
                </form>
              <Button variant="primary" type="submit">Submit</Button>
               {/* onClick send authentication data to back end to log in the admin */}
              { /** useState to contain data from remote server and to contain form data */ }
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