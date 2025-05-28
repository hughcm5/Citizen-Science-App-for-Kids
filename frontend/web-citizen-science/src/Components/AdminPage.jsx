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

  const [adminData, setAdminData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);

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

  /* Prepare the retrieve on the frontend */
  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const admin_payload = {
      admin_firstname,
      admin_lastname,
      email,
      role
    }
    console.log('admin:', Admin);
    axios
      .post("http://localhost:5000/admins", admin_payload)
      .then((response) => {
        console.log('Admin creation successful');
        fetchData();
      })
      .catch((err) => {
        console.log('Failed to create admin');
        if (err.data) {
          console.log(JSON.stringify(err.data));
        }
      });
  };

  const toHumanReadableDate = (backendDateStr) => {
    const date = new Date(backendDateStr);
    // TODO: Format the string to remove timezone (not needed)
    return date.toISOString().split('T')[0];
  }

  const deleteAdmin = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:5000/admins/` + id.toString());
    
    console.log('Admin deleted successfully:', response.data);
    // Handle successful deletion (todo: update/refresh table upon deletion)
    fetchData();
  } catch (error) {
    console.error('Error deleting admin:', error);
    // Error handling
  }
};

  return (
    <Container fluid>
      <Container className="content">
        <Row>
          <Col md={9}>
            <h1 style={{paddingBottom: '40px'}}>
             The science projects are administered by educators, so children can meaningfully contribute and gain experience in scientific research
            </h1>
            <h2>Current Admins:</h2>
            <p></p>
            {
              // For debugging purposes only
              /*
              <pre>{JSON.stringify(adminData, null, 2)}</pre>
              */
            }
            <table class="adminTable">
              <thead>
                  <tr>
                    <th>ID #</th>
                    <th>Classes</th>
                    <th>Last Name</th>
                    <th>First Name</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Email</th>
                    <th> </th>
                  </tr>
                  </thead>
                  <tbody>
                  {adminData.map(admin => (
                    <tr id={admin}>
                      <td>{admin.admin_id}</td>
                      <td>{admin.classrooms.length}</td>
                      <td>{admin.admin_lastname}</td>
                      <td>{admin.admin_firstname}</td>
                      <td>{admin.role}</td>
                      <td>{toHumanReadableDate(admin.created_at)}</td>
                      <td>{toHumanReadableDate(admin.updated_at)}</td>
                      <td>{admin.email}</td>
                      <td><button onClick={(event) => deleteAdmin(admin.admin_id)}>Delete</button></td>
                    </tr>
                  ))}
                  </tbody>
            </table>

            <h2>New Admin</h2>
              <p></p>
            <form onSubmit={handleSubmit}>
              <label>
              Create a new Admin - Enter the Admin's Details: <br />
              <input type="text" placeholder="First Name" value={admin_firstname} onChange={(e) => setadmin_firstname(e.target.value)} />
              <input type="text" placeholder="Last Name" value={admin_lastname} onChange={(e) => setadmin_lastname(e.target.value)} />
              <input type="text" placeholder="Admin's Email" value={email} onChange={(e) => setemail(e.target.value)} />
              <input type="text" placeholder="Admin's Role (teacher, principle, etc)" value={role} onChange={(e) => setrole(e.target.value)} />
              </label> <br />
              <Button variant="primary" type="submit">Submit</Button>
            </form>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default Admin
