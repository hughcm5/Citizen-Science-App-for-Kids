/* Create a New Observation : Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState, useEffect } from 'react';
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

    /* Prepare the retrieve on the frontend */
  const [observationData, setobservationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/observations');
        setobservationData(response.data);
        setLoading(false);
      } catch (err) {
        setRetrieveError(err)
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            <h2>Current Observations:</h2>
            <p>To do: Use a Table to format the Retrieved Data from the Backend - Data populates as JSON (good for debugging but needs to be changed)</p>
            <pre>{JSON.stringify(observationData, null, 2)}</pre>
            <h2>Create New Observation</h2>
            <p>Enter the observation details:</p>
            <form onSubmit={handleSubmit}>
              <label>
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
