/* Create a New Observation : Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import axios from "axios";

/* ------------ Page Content  ------------*/
function Observation() {
    const [project_id, setproject_id] = useState('');
  const [class_id, setclass_id] = useState('');
  const [data, setdata] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const observation_data = {
        project_id,
      class_id,
      data
    }
    console.log('data:', data);
    axios
      .post("http://localhost:5000/observations", observation_data)
      .then((response) => {
        console.log('Observation post successful');
      })
      .catch((err) => {
        console.log('Failed to post observation');
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
              Each project has a collection of observations made by the students in a class
            </h1>
            <h2> You can create a new observation: </h2>
              
            <form onSubmit={handleSubmit}>
              <label>
              Create a new observation - Enter the observation Details:
              <input type="number" placeholder="Project ID" value={project_id} onChange={(e) => setproject_id(e.target.value)} />
              <input type="number" placeholder="Class ID" value={class_id} onChange={(e) => setclass_id(e.target.value)} />
              <input type="textfield" placeholder="describe the data for the students" value={data} onChange={(e) => setdata(e.target.value)} />
              </label>
              <Button variant="primary" type="submit">Submit</Button>
            </form>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default Observation
