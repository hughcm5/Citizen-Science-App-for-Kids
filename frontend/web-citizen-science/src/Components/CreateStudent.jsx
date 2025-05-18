/* Create a New Student : Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import axios from "axios";

/* ------------ Page Content  ------------*/
function Student() {
  const [class_id, setclass_id] = useState('');
  const [student_lastname, setstudent_lastname] = useState('');
  const [student_firstname, setstudent_firstname] = useState('');
  const [class_codes, setclass_codes] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const student_data = {
      class_id,
      student_lastname,
      student_firstname,
      class_codes
    }
    console.log('student:', Student);
    axios
      .post("http://localhost:5000/students", student_data)
      .then((response) => {
        console.log('Student creation successful');
      })
      .catch((err) => {
        console.log('Failed to create student in the database');
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
             Each classroom will have students that can access certain projects based on their assigned class codes
            </h1>
            <h2> You can create a new student for the website here: </h2>
              
            <form onSubmit={handleSubmit}>
              <label>
              Create a new Student - Enter the Students's Details:
              <input type="number" placeholder="Class ID" value={class_id} onChange={(e) => setclass_id(e.target.value)} />
              <input type="text" placeholder="Last Name" value={student_lastname} onChange={(e) => setstudent_lastname(e.target.value)} />
              <input type="text" placeholder="First Name" value={student_firstname} onChange={(e) => setstudent_firstname(e.target.value)} />
              <input type="text" placeholder="Class Code" value={class_codes} onChange={(e) => setclass_codes(e.target.value)} />
              </label>
              <Button variant="primary" type="submit">Submit</Button>
            </form>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default Student
