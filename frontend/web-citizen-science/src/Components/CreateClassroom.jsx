/* Create a New Classroom : Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState, useEffect } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import axios from "axios";

/* ------------ Page Content  ------------*/
function Classroom() {
  const [class_code, setclass_code] = useState('');
  const [admin_id, setadmin_id] = useState('');
  const [class_name, setclass_name] = useState('');
  const [grade_level, setgrade_level] = useState('');

    /* Prepare the retrieve on the frontend */
  const [classData, setclassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/classrooms');
        setclassData(response.data);
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
    const class_data = {
      class_code,
      admin_id: parseInt(admin_id),
      class_name,
      grade_level
    }
    console.log('classroom:', Classroom);
    console.log('classroom data:', class_data); // Log the class_data object for debugging
    axios
      .post("http://localhost:5000/classrooms", class_data)
      .then((response) => {
        console.log('Classroom creation successful');
      })
      .catch((err) => {
        console.log('Failed to create classroom');
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
             Different classrooms will house appropriate projects. 
            </h1>
            <h2>Current Classrooms:</h2>
            <p>To do: Use a Table to format the Retrieved Data from the Backend - Data populates as JSON (good for debugging but needs to be changed)</p>
            <pre>{JSON.stringify(classData, null, 2)}</pre>

            <h2> You can create a new classroom here: </h2>
              
            <form onSubmit={handleSubmit}>
              <label>
              Create a new Classroom - Enter the Class Details:
              <input type="number" placeholder="Class Code" value={class_code} onChange={(e) => setclass_code(e.target.value)} />
              <input type="number" placeholder="Admin's ID" value={admin_id} onChange={(e) => setadmin_id(e.target.value)} />
              <input type="text" placeholder="Classroom's Name" value={class_name} onChange={(e) => setclass_name(e.target.value)} />
              <input type="text" placeholder="Grade Level (K, 1st, etc)" value={grade_level} onChange={(e) => setgrade_level(e.target.value)} />
              </label>
              <Button variant="primary" type="submit">Submit</Button>
            </form>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default Classroom
