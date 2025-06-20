/* Create a New Classroom : Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState, useEffect } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import axios from "axios";

/* ------------ Classroom Table  ------------*/
function Classroom() {
  const [class_code, setclass_code] = useState('');
  const [admin_id, setadmin_id] = useState('');
  const [class_name, setclass_name] = useState('');
  const [grade_level, setgrade_level] = useState('');

    /* Prepare the retrieve on the frontend */
  const [admins, setAdmins] = useState([]);
  const [classData, setclassData] = useState([]); // make sure the default is an empty list 
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);

  const [editedId, setEditedId] = useState(null);
  const [editedClassData, setEditedClassData] = useState({});

/* ------------ Retrieve  ------------*/
  const fetchData = async () => {
    // todo refresh table when other users update during session
    try {
      const response = await axios.get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/classrooms');
      setclassData(response.data);
      setLoading(false);
    } catch (err) {
      setRetrieveError(err)
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    fetchAdmins();
  }, []);
  
/* ------------ Create ------------*/
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
      .post(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/classrooms', class_data)
      .then((response) => {
        const msg = 'Classroom creation successful';
        console.log(msg);
        window.alert(msg);
        fetchData();   // refresh table after creation
      })
      .catch((err) => {
        // todo : signal if admin ID not found
        const msg = 'Failed to create classroom';
        console.error(msg);
        window.alert(msg);
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
  const deleteClassroom = async (class_id) => {
  try{
    const response = await axios.delete(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/classrooms/' + class_id.toString());

    const msg = 'Classroom deleted successfully';
    console.log(msg, ': ', response?.data);
    window.alert(msg);
    // Handle successful deletion and update/refresh table upon deletion
    fetchData();
    }
    catch (error){
      const msg = 'Error deleting classroom';
      console.error(msg, ': ', error);
      window.alert(msg);
      // Error handling
    }
  };

/* ------------ Update ------------*/
  const fetchAdmins = async () => {
    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/admins')
      .then((response) => {
        console.log('Fetched admins successfully');
        const admins = response.data
        setAdmins(response.data);

        // Set default selected classroom if null
        if (admin_id === null || admin_id === '') {
          setadmin_id(admins[0].admin_id);
        } else {
          // If it is already selected, make sure it exists
          const existingadmin= admins.find(e => e.admin_id === admin_id);
          // Else, just select the first one by default
          if (!existingadmin) {
            setadmin_id(admins[0].admin_id);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to retrieve admins');
        console.error(err);
      });
  }

  const onEditRow = (classroom) => {
    // allow the row's content to be edited by the user
    setEditedId(classroom.class_id);
    setEditedClassData(classroom);
  }
  const onEditChange = (x) => {
    const { name, value } = x.target;
    setEditedClassData({...editedClassData, [name]: value});
  }
  const cancelEdit = () => {
    setEditedId(null);
    setEditedClassData({});
  }
  const onSaveEdit = async () => {
    if (!editedId) {
      // If nothing was edited, do nothing
      return;
    }

    // TODO: frontend validation to catch mistakes before sending to the backend

    const class_payload = {
      'class_code' : editedClassData.class_code,
      'class_name' : editedClassData.class_name,
      'grade_level' : editedClassData.grade_level,
      'admin_id' : editedClassData.admin_id, // foreign key
    };
    // TODO: Change or disable the "save" button to say "saving" or similar so that there is feedback for the user
    try {
      const response = await axios.put(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/classrooms/' + editedClassData.class_id.toString(), class_payload);
      // handle success (update/refresh table)


      const msg = 'Classroom updated successfully';
      console.log(msg, ': ', response?.data);
      window.alert(msg);

      // update fields on fromt end, need to displays something for user
      // iterate to match classroom with id to edit
      const class_to_update = classData.find(obj => obj.class_id === editedClassData.class_id);
      if (class_to_update) {
        class_to_update.class_code = editedClassData.class_code;
        class_to_update.class_name = editedClassData.class_name;
        class_to_update.grade_level = editedClassData.grade_level;
        class_to_update.admin_id = editedClassData.admin_id;
        // need to get foreign key : admin id
      }
      fetchData(); // repopulate the table
      cancelEdit(); // stop the editing processs
    } catch (error) {
      const msg = 'Error updating this classroom';
      console.error(msg, ': ', error);
      window.alert(msg);
      // error handling
      // TODO frontend implementation: print error for user, etc
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
        fontSize: '50px', padding:'1.5%', color:'black', filter: 'drop-shadow(2px 2px 1px blue)'}}>Classrooms </h1>
<Row style={{
          backgroundColor:'#86adde80', borderRadius: '10px',    
                }}>          <Col md={9}>
            <p style={{fontSize:'20px', margin:'1%'}}>
             Different classrooms will house different students and projects in the system</p>
            <h2>Current Classrooms:</h2>
            <p></p>
                        {
              // For debugging purposes only
           //  <pre>{JSON.stringify(classData, null, 2)}</pre>
            }
            <table className ="classTable" style={tableStyle}>
              <thead>
                <tr>
                    <th> </th>
                    <th>ID #</th>
                    <th>Class Code</th>
                    <th>Name</th>
                    <th>Grade Level</th>
                    <th>Total Projects</th>
                    <th>Total Students</th>
                    <th>Creation Date</th>
                    <th>Updated Date</th>
                    <th> </th>
                </tr>
              </thead>
              <tbody>
                {classData.map(classroom => (
                 <tr key={classroom.class_id}>
                    <td>
                        {
                          editedId === classroom.class_id
                          ? (<>
                              <button onClick={() => cancelEdit()}>Cancel</button>
                              <button onClick={() => onSaveEdit()}>Save</button>
                            </>)
                          : (<button onClick={() => onEditRow(classroom)}>Edit</button>)
                        }
                      </td>
                  <td>{classroom.class_id}</td>
                  <td>
{
                  editedId === classroom.class_id ? (<input name="class_code" type="number" value={editedClassData.class_code} onChange={onEditChange} />) : (classroom.class_code)
                  }
                  </td>
                  <td> 
                    {
                  editedId === classroom.class_id ? (<input name="class_name" type="text"
                  value={editedClassData.class_name}
                  onChange={onEditChange} />) : (classroom.class_name)
                    } 
                  </td>
                  <td>
                    {
                    editedId === classroom.class_id ? (<input name="grade_level" type="text" 
                    value={editedClassData.grade_level} 
                    onChange={onEditChange}/>) : (classroom.grade_level)
                    }
                    </td>
                  <td>{classroom.projects.length}</td>
                  <td>{classroom.students.length}</td>
                  <td>{toHumanReadableDate(classroom.created_at)}</td>
                  <td>{toHumanReadableDate(classroom.updated_at)}</td>
                  <td><button onClick={(event) => deleteClassroom(classroom.class_id)}>Delete</button></td>
                 </tr> 
                ))}
              </tbody>
            </table>

            <h2> New Classroom </h2>
              <p></p>
            <form onSubmit={handleSubmit}>
              <label>
              Create a new Classroom - Enter the Class Details: <br />
              <select
                value={admin_id}
                onChange={e => setadmin_id(e.target.value)}
                >
                {admins.map(admin => (
                  <option value={admin.admin_id}>{admin.admin_id + ' (' + admin.admin_firstname + ')'}</option>
                ))}
              </select>
             <input type="number" placeholder="Class Code" value={class_code} onChange={(e) => setclass_code(e.target.value)} />
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