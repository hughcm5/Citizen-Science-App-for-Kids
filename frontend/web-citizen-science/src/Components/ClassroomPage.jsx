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
  const [classData, setclassData] = useState([]); // make sure the default is an empty list 
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);

/* ------------ Retrieve  ------------*/
  const fetchData = async () => {
    // todo refresh table when other users update during session
    try {
      const response = await axios.get('http://localhost:5000/classrooms');
      setclassData(response.data);
      setLoading(false);
    } catch (err) {
      setRetrieveError(err)
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  
/* ------------ Create  ------------*/
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
        fetchData();   // refresh table after creation
      })
      .catch((err) => {
        // todo : signal if admin ID not found
        console.log('Failed to create classroom');
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
  const deleteClassroom = async (id) => {
  try{
    const response = await axios.delete('http://localhost:5000/classrooms' + id.toString());
    console.log('Classroom deleted successfully:', response.data);
    // Handle successful deletion (todo: update/refresh table upon deletion)
    fetchData();
    }
    catch (error){
    console.error('Error deleting classroom:', error);
    // Error handling
    }
  };

/* ------------ Page Content  ------------*/
  return (
    <Container fluid>
      <Container className="content">
        <Row>
          <Col md={9}>
            <h1 style={{paddingBottom: '40px'}}>
             Different classrooms will house different students and projects in the system
            </h1>
            <h2>Current Classrooms:</h2>
            <p></p>
                        {
              // For debugging purposes only
           //  <pre>{JSON.stringify(classData, null, 2)}</pre>
              
            }
            <table className ="classTable">
              <thead>
                <tr>
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
                {classData?.map(classroom => (
                 <tr id={classroom}>
                  <td>{classroom.class_id}</td>
                  <td>{classroom.class_code}</td>
                  <td>
                  <input
                  type="text"
                  value={classroom.class_name}
                  onChange={e => setclass_name(e.target.value)} 
                  id="class_name"/>
                  {classroom.class_name}</td>
                  <td>{classroom.grade_level}</td>
                  <td>{classroom.projects.length}</td>
                  <td>{classroom.students.length}</td>
                  <td>{toHumanReadableDate(classroom.created_at)}</td>
                  <td>{toHumanReadableDate(classroom.updated_at)}</td>
                  <td><button onClick={(event) => deleteClassroom(classData.class_id)}>Delete</button></td>
                 </tr> 
                ))}
              </tbody>
            </table>

            <h2> New Classroom </h2>
              <p></p>
            <form onSubmit={handleSubmit}>
              <label>
              Create a new Classroom - Enter the Class Details: <br />
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
