/* Create a New Student : Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState, useEffect } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import axios from "axios";

/* ------------ Student Table  ------------*/
function Student() {
  const [class_id, setclass_id] = useState('');
  const [student_lastname, setstudent_lastname] = useState('');
  const [student_firstname, setstudent_firstname] = useState('');

    /* Prepare the retrieve on the frontend */
  const [studentData, setstudentData] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);

  const [editedId, setEditedId] = useState(null);
  const [editedStudentData, setEditedStudentData] = useState({});

/* ------------ Retrieve  ------------*/
  const fetchData = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/students');
      setstudentData(response.data);
      setLoading(false);
    } catch (err) {
        setRetrieveError(err)
        setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/classrooms')
      .then((response) => {
        console.log('Fetched classrooms successfully');
        const classrooms = response.data
        setClassrooms(response.data);

        // Set default selected classroom if null
        if (class_id === null || class_id === '') {
          setclass_id(classrooms[0].class_id);
        } else {
          // If it is already selected, make sure it exists
          const existingClass= classrooms.find(e => e.class_id === class_id);
          // Else, just select the first one by default
          if (!existingClass) {
            setclass_id(classrooms[0].class_id);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to retrieve classrooms');
        console.error(err);
      });
  }

  const onEditRow = (student) => {
    // enable the labels by setting an edited id to render the inputs
    setEditedId(student.student_id);
    setEditedStudentData(student);
  }

  const onEditChange = (x) => {
    const { name, value } = x.target;
    setEditedStudentData({...editedStudentData, [name]: value});
  }

  const cancelEdit = () => {
    setEditedId(null);
    setEditedStudentData({});
  }

  const onSaveEdit = async () => {
    if (!editedId) {
      // If nothing was edited, do nothing
      return;
    }

    // TODO: Maybe do some frontend validation to catch mistakes before sending to the backend?

    const student_payload = {
      'student_lastname' : editedStudentData.student_lastname,
      'student_firstname' : editedStudentData.student_firstname,
      'class_id' : editedStudentData.class_id
    };

    // TODO: Change or disable the "save" button to say "saving" or similar so that there is feedback that saving is happening

    try {
      const response = await axios.put(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/students/' + editedStudentData.student_id.toString(), student_payload);
      console.log('Student updated successfully: ', response.data);
      // Handle successful update (update/refresh table upon deletion)

      // Update the fields on the front end side to speed it up?
      // iterate to find the admin with the same id
      const student_to_be_updated = studentData.find(obj => obj.student_id === editedStudentData.admin_id);
      if (student_to_be_updated) {
        student_to_be_updated.student_firstname = editedStudentData.admin_firstname;
        student_to_be_updated.student_lastname = editedStudentData.admin_lastname;
        student_to_be_updated.class_id = editedStudentData.class_id;
      }

      fetchData();
      // A bit of an oxymoron since the edit was already successful but this is to disable the edit fields
      cancelEdit();
      // TODO: have some kind of popup telling the user of the successful edit
    } catch (error) {
      console.error('Error updating student:', error);
      // Error handling
      // TODO: Maybe autocancel or leave up at editing mode?
      // TODO: have some kind of popup telling the user that something wrong happened
    }
  }

  const deleteStudent = async (id) => {
    try {
      const response = await axios.delete(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/students/' + id.toString());
      
      console.log('Student deleted successfully:', response.data);
      // Handle successful deletion (update/refresh table upon deletion)
      fetchData();
    } catch (error) {
      console.error('Error deleting student:', error);
      // Error handling
    }
  };

  /* Prepare the retrieve on the frontend */
  useEffect(() => {
    fetchData();
    fetchClassrooms();
  }, []);

/* ------------ Create  ------------*/
  const handleSubmit = (event) => {
    event.preventDefault();
    const student_data = {
      classroom_id: class_id,
      class_id: class_id,
      student_lastname,
      student_firstname
    }
    console.log('student:', Student);
    axios
      .post(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/students', student_data)
      .then((response) => {
        console.log('Student creation successful');
        fetchData();
      })
      .catch((err) => {
        console.log('Failed to create student in the database');
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

/* ------------ Page Content  ------------*/
  return (
    <Container fluid>
      <Container className="content">
        <Row>
          <Col md={9}>
            <h1 style={{paddingBottom: '10px'}}>
            Students Page
            </h1>
            <p>Each classroom will have students that can access certain projects based on their assigned class codes</p>
            <h2>Current Students:</h2>

            <p>To do: Use a Table to format the Retrieved Data from the Backend - Data populates as JSON (good for debugging but needs to be changed)</p>

            { /* (<pre>{JSON.stringify(studentData, null, 2)}</pre>) */ }
            
          {
            // /* ------------ Student Table  ------------*/
            // /* ------------ RUD Funtions  ------------*/
          }
          <table className='studentTable'>
            <thead>
              <tr>
                <th> </th>
                <th>ID #</th>
                <th>Class</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Created</th>
                <th>Updated</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
            {studentData.map(student => (
              <tr key={student.student_id}>
                <td>
                  {
                    editedId === student.student_id
                    ? (<>
                        <button onClick={() => cancelEdit()}>Cancel</button>
                        <button onClick={() => onSaveEdit()}>Save</button>
                      </>)
                    : (<button onClick={() => onEditRow(student)}>Edit</button>)
                  }
                </td>
                <td>{student.student_id}</td>
                <td>{student.class_id}</td>
                <td>
                  {
                    editedId === student.student_id
                    ? (<input name="student_lastname" type="text" value={editedStudentData.student_lastname} onChange={onEditChange} />)
                    : (student.student_lastname)
                  }
                </td>
                <td>
                  {
                    editedId === student.student_id
                    ? (<input name="student_firstname" type="text" value={editedStudentData.student_firstname} onChange={onEditChange} />)
                    : (student.student_firstname)
                  }
                </td>
                <td>{toHumanReadableDate(student.created_at)}</td>
                <td>{toHumanReadableDate(student.updated_at)}</td>
                <td><button onClick={(event) => deleteStudent(student.student_id)}>Delete</button></td>
              </tr>
            ))}
            </tbody>
          </table>
            
                      {
            // /* ------------ Create Student Form ------------*/
          }
            <h2> You can create a new student for the website here: </h2>
            <form onSubmit={handleSubmit}>
              <label>
              Create a new Student - Enter the Students's Details:    </label><br />
              <select
                value={class_id}
                onChange={e => setclass_id(e.target.value)}
                >
                {classrooms.map(classroom => (
                  <option value={classroom.class_id}>{classroom.class_name + ' (' + classroom.class_id + ')'}</option>
                ))}
              </select>
              <input type="text" placeholder="Last Name" value={student_lastname} onChange={(e) => setstudent_lastname(e.target.value)} />
              <input type="text" placeholder="First Name" value={student_firstname} onChange={(e) => setstudent_firstname(e.target.value)} />
              <br />
              <Button variant="primary" type="submit">Submit</Button>
            </form>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default Student
