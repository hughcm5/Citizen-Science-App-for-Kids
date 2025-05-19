/* View Project Pages on the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState, useEffect } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from "axios";

/* ------------ Page Content  ------------*/
function ViewProject() {
  const [project_id] = useState('');
  const [class_id] = useState('');
  const [project_title] = useState('');
  const [description] = useState('');

    /* Prepare the retrieve on the frontend */
  const [projectData, setprojectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);

  useEffect(() => {
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

    fetchData();
  }, []);

  return (
    <Container fluid>
      <Container className="content">
        <Row>
          <Col md={9}>
            <h1 style={{paddingBottom: '40px'}}>
              You can view a collection of Citizen science projects.
            </h1>
            <h2>Current Projects:</h2>
            <p>To do: Use a Table to format the Retrieved Data from the Backend - Data populates as JSON (good for debugging but needs to be changed)</p>
            <pre>{JSON.stringify(projectData, null, 2)}</pre>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default ViewProject
