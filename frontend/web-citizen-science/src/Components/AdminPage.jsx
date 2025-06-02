/* Create a New Admin : Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState, useEffect } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import axios from "axios";

/* ------------ Admin Table  ------------*/
function Admin() {
      /* Prepare CRUD on the frontend */
  const [admin_firstname, setadmin_firstname] = useState('');
  const [admin_lastname, setadmin_lastname] = useState('');
  const [email, setemail] = useState('');
  const [role, setrole] = useState('');

  const [adminData, setAdminData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);

  const [editedId, setEditedId] = useState(null);
  const [editedAdminData, setEditedAdminData] = useState({});
  
/* ------------ Retrieve  ------------*/
  const fetchData = async () => {
    try {
      // const response = await axios.get('https://backend-dot-citizen-science-app-for-kids.wn.r.appspot.com/admins');
      const response = await axios.get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/admins');
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

/* ------------ Create  ------------*/
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
      // .post("https://backend-dot-citizen-science-app-for-kids.wn.r.appspot.com/admins", admin_payload)
      .post(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/admins', admin_payload)
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
    // Format the string to remove timezone 
    return date.toISOString().split('T')[0];
  }

  /* ------------ Delete  ------------*/
  const deleteAdmin = async (id) => {
  try {
    // const response = await axios.delete(`https://backend-dot-citizen-science-app-for-kids.wn.r.appspot.com/admins/` + id.toString());
    const response = await axios.delete(process.env.REACT_APP_BACKEND_GATEWAY_URL + `/admins/` + id.toString());
    
    console.log('Admin deleted successfully:', response.data);
    // Handle successful deletion (update/refresh table upon deletion)
    fetchData();
  } catch (error) {
    console.error('Error deleting admin:', error);
    // Error handling
  }
};

  const onEditRow = (admin) => {
    // enable the labels by setting an edited id to render the inputs
    setEditedId(admin.admin_id);
    setEditedAdminData(admin);
  }

  const onEditChange = (x) => {
    const { name, value } = x.target;
    setEditedAdminData({...editedAdminData, [name]: value});
  }

  const cancelEdit = () => {
    setEditedId(null);
    setEditedAdminData({});
  }

  const onSaveEdit = async () => {
    if (!editedId) {
      // If nothing was edited, do nothing
      return;
    }

    // TODO: Maybe do some frontend validation to catch mistakes before sending to the backend?

    const admin_payload = {
      'admin_id' : editedAdminData.admin_id,
      'admin_firstname' : editedAdminData.admin_firstname,
      'admin_lastname' : editedAdminData.admin_lastname,
      'email' : editedAdminData.email,
      'role' : editedAdminData.role,
      'oauth_id' : editedAdminData.oauth_id
    };

    // TODO: Change or disable the "save" button to say "saving" or similar so that there is feedback that saving is happening

    try {
      // const response = await axios.put('https://backend-dot-citizen-science-app-for-kids.wn.r.appspot.com/admins/' + editedAdminData.admin_id.toString(), admin_payload);
      const response = await axios.put(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/admins/' + editedAdminData.admin_id.toString(), admin_payload);
      console.log('Admin updated successfully: ', response.data);
      // Handle successful update (update/refresh table upon deletion)

      // Update the fields on the front end side to speed it up?
      // iterate to find the admin with the same id
      const admin_to_be_updated = adminData.find(obj => obj.admin_id === editedAdminData.admin_id);
      if (admin_to_be_updated) {
        admin_to_be_updated.admin_firstname = editedAdminData.admin_firstname;
        admin_to_be_updated.admin_lastname = editedAdminData.admin_lastname;
        admin_to_be_updated.email = editedAdminData.email;
        admin_to_be_updated.role = editedAdminData.role;
        admin_to_be_updated.oauth_id = editedAdminData.oauth_id;
      }

      fetchData();
      // A bit of an oxymoron since the edit was already successful but this is to disable the edit fields
      cancelEdit();
      // TODO: have some kind of popup telling the user of the successful edit
    } catch (error) {
      console.error('Error updating admin:', error);
      // Error handling
      // TODO: Maybe autocancel or leave up at editing mode?
      // TODO: have some kind of popup telling the user that something wrong happened
    }
  }

  /* ------------ Table Styling ------------*/
  var tableStyle = {
       "border": "1px solid black",
    };
  var column = {
      padding: '10px',
      "border-bottom": "1px solid black"
    };

/* ------------ Page Content  ------------*/
  return (
    <Container fluid>
      <Container className="content">
        <h1 style={{
        fontSize: '50px', padding:'1.5%', color:'black', filter: 'drop-shadow(2px 2px 1px blue)'}}> Admins</h1>
                  <Row style={{
          backgroundColor:'#86adde80', borderRadius: '10px',    
                }}>
                <Col md={9}>
            <p>The science projects are administered by educators</p>
             
            
            <h2>Current Admins:</h2>
            <br />
            {
              // For debugging purposes only
              /*
              <pre>{JSON.stringify(adminData, null, 2)}</pre>
              */
            }
            <table className="adminTable" style={tableStyle}>
              <thead>
                  <tr>
                    <th> </th>
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
                    <tr key={admin.admin_id}>
                      <td>
                        {
                          editedId === admin.admin_id
                          ? (<>
                              <button onClick={() => cancelEdit()}>Cancel</button>
                              <button onClick={() => onSaveEdit()}>Save</button>
                            </>)
                          : (<button onClick={() => onEditRow(admin)}>Edit</button>)
                        }
                      </td>
                      <td>{admin.admin_id}</td>
                      <td>{admin.classrooms.length}</td>
                      <td>
                        {
                          editedId === admin.admin_id
                          ? (<input name="admin_lastname" type="text" value={editedAdminData.admin_lastname} onChange={onEditChange} />)
                          : (admin.admin_lastname)
                        }
                      </td>
                      <td>
                        {
                          editedId === admin.admin_id
                          ? (<input name="admin_firstname" type="text" value={editedAdminData.admin_firstname} onChange={onEditChange} />)
                          : (admin.admin_firstname)
                        }
                      </td>
                      <td>
                        {
                          editedId === admin.admin_id
                          ? (<input name="role" type="text" value={editedAdminData.role} onChange={onEditChange} />)
                          : (admin.role)
                        }
                      </td>
                      <td>{toHumanReadableDate(admin.created_at)}</td>
                      <td>{toHumanReadableDate(admin.updated_at)}</td>
                      <td>
                        {
                          editedId === admin.admin_id
                          ? (<input name="email" type="text" value={editedAdminData.email} onChange={onEditChange} />)
                          : (admin.email)
                        }
                      </td>
                      <td><button onClick={(event) => deleteAdmin(admin.admin_id)}>Delete</button></td>
                    </tr>
                  ))}
                  </tbody>
            </table>

            <h2>New Admin</h2>
              <p></p>
            <form onSubmit={handleSubmit}>
              <label>
              Create a new Admin - Enter the Admin's Details: </label><br />
              <input type="text" placeholder="First Name" value={admin_firstname} onChange={(e) => setadmin_firstname(e.target.value)} />
              <input type="text" placeholder="Last Name" value={admin_lastname} onChange={(e) => setadmin_lastname(e.target.value)} />
              <input type="text" placeholder="Admin's Email" value={email} onChange={(e) => setemail(e.target.value)}/>
              <input type="text" placeholder="Admin's Role (teacher, principle, etc)" value={role} onChange={(e) => setrole(e.target.value)}/>
              <br />
              <Button variant="primary" type="submit">Submit</Button>
            </form>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default Admin
