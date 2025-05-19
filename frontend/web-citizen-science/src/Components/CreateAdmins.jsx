/* Create a New Admin : Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState, useEffect } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import axios from "axios";

/* ------------ Page Content  ------------*/
function Admin() {
  const [admin_firstname, setadmin_firstname] = useState('');
  const [admin_lastname, setadmin_lastname] = useState('');
  const [email, setemail] = useState('');
  const [role, setrole] = useState('');

  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admins');
        setAdminData(response.data);
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
    const admin_data = {
      admin_firstname,
      admin_lastname,
      email,
      role
    }
    console.log('admin:', Admin);
    axios
      .post("http://localhost:5000/admins", admin_data)
      .then((response) => {
        console.log('Admin creation successful');
      })
      .catch((err) => {
        console.log('Failed to create admin');
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
             The science projects are administered by educators, so children can meaningfully contribute and gain experience in scientific research
            </h1>

            <pre>{JSON.stringify(adminData, null, 2)}</pre>

            <h2> You can create a new admin for the website here: </h2>
              
            <form onSubmit={handleSubmit}>
              <label>
              Create a new Admin - Enter the Admin's Details:
              <input type="text" placeholder="First Name" value={admin_firstname} onChange={(e) => setadmin_firstname(e.target.value)} />
              <input type="text" placeholder="Last Name" value={admin_lastname} onChange={(e) => setadmin_lastname(e.target.value)} />
              <input type="text" placeholder="Admin's Email" value={email} onChange={(e) => setemail(e.target.value)} />
              <input type="text" placeholder="Admin's Role (teacher, principle, etc)" value={role} onChange={(e) => setrole(e.target.value)} />
              </label>
              <Button variant="primary" type="submit">Submit</Button>
            </form>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default Admin
