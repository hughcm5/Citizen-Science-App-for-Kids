/* Observation : Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState, useEffect } from 'react';
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import axios from "axios";

/* ------------ Page Functions  ------------*/
function Observation() {
  /* Prepare the payloads */
  const [data, setdata] = useState('');

  const [newProjectId, setNewProjectId] = useState(null);
  const [newStudentId, setNewStudentId] = useState(null);
  const [newObservationData, setNewObservationData] = useState([]);
  const [newObservationRow, setNewObservationRow] = useState([]);
  const [newObservationPairs, setNewObservationPairs] = useState([]);

  const [observationRowNumber, setObservationRowNumber] = useState(1);

  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [observations, setObservations] = useState([]);

    /* Prepare the retrieve on the frontend */
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);

  /* ------------ Retrieve  ------------*/
  const fetchProjects = async () => {
    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + "/projects")
      .then((response) => {
        const project_data = response.data;
        setProjects(project_data);

        // Set default selected project if null or empty
        const existingProject = project_data.find(e => e.project_id === newProjectId);
        if (existingProject === undefined || existingProject == null || existingProject === '') {
          setNewProjectId(project_data[0].project_id);
        }
      })
      .catch((err) => {
        console.log('Failed to fetch project data');
        if (err.data) {
          console.log(err.data);
        }
      });
  }

  const fetchStudents = async () => {
    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/students')
      .then((response) => {
        const student_data = response.data;
        setStudents(student_data);

        // Set default selected student if null or empty
        const existingStudent = student_data.find(e => e.student_id === newStudentId);
        if (existingStudent === undefined || existingStudent == null || existingStudent === '') {
          setNewStudentId(student_data[0].student_id);
        }
      })
      .catch((err) => {
        console.log('Failed to fetch student data');
        if (err.data) {
          console.log(err.data);
        }
      });
  }

  const fetchClassrooms = async () => {
    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/classrooms')
      .then((response) => {
        const class_data = response.data;
        setStudents(class_data);
      })
      .catch((err) => {
        console.log('Failed to fetch classroom data');
        if (err.data) {
          console.log(err.data);
        }
      });
  }

  const fetchObservations = async () => {
    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + "/observations")
      .then((response) => {
        const observation_data = response.data;
        setObservations(observation_data);
      })
      .catch((err) => {
        console.log('Failed to fetch observation data');
        if (err.data) {
          console.log(err.data);
        }
      });
  }

  /* ------------ Create  ------------*/
  const handleSubmit = (event) => {
    event.preventDefault();

    const project_id = parseInt(newProjectId);
    if (!project_id || project_id === '') {
      console.error('A project ID is required');
      return;
    }

    const student_id = parseInt(newStudentId);
    if (!student_id || newStudentId === '') {
      console.error('A student ID is required');
      return;
    }

    const observation_dict = {}
    newObservationPairs.forEach((e, i) => {
      const key = e.key;
      const value = e.value;

      if (key !== null && key !== '' && value !== null && value !== '') {
        observation_dict[key] = value;
      }
    });

    if (Object.keys(observation_dict).length < 1) {
      console.error('There needs to be at least one observation');
      return;
    }

    const observationPayload = {
      'project_id': project_id,
      'student_id': student_id,
      'observation_data': observation_dict
    }

    console.log("Payload is as follows: ");
    console.log(observationPayload);

    axios
      .post(process.env.REACT_APP_BACKEND_GATEWAY_URL + "/observations", observationPayload)
      .then((response) => {
        console.log('Observation post successful');
        console.log(response);
      })
      .catch((err) => {
        console.error('Failed to post observation');
        console.error(err);
      });
  };

  const handleObservationInputChange = (index, field, event) => {
    const newNewPairs = [...newObservationPairs];
    newNewPairs[index][field] = event.target.value;
    setNewObservationPairs(newNewPairs);
  };

  const addNewObservationPair = () => {
    setNewObservationPairs([...newObservationPairs, { key: '', value: '' }]);
  }

  const deleteNewObservationPair = (index) => {
    const newNewPairs = [...newObservationPairs];
    newNewPairs.splice(index, 1);
    setNewObservationPairs(newNewPairs);
  }

  useEffect(() => {
    fetchProjects();
    fetchStudents();
    fetchObservations();
  }, []);


/* ------------ Page Content  ------------*/
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
            <pre>{JSON.stringify(observations, null, 2)}</pre>
            {/* ------------ Observation Creation ------------*/}
            <h2>Create New Observation</h2>
            <p>Enter the observation details:</p>
            <form onSubmit={handleSubmit}>
              <label>

              <select
                value={newProjectId}
                onChange={e => setNewProjectId(e.target.value)} >
                {projects.map(project => (
                  <option value={project.project_id}>{project.project_title + ' (' + project.project_id.toString() + ')'}</option>
                ))}
              </select>

              <select
                value={newStudentId}
                onChange={e => setNewStudentId(e.target.value)} >
                {students.map(student => (
                  <option value={student.student_id}>{student.student_lastname + ', ' + student.student_firstname + ' (' + student.student_id.toString() + ')'}</option>
                ))}
              </select>
              <br />
              
              {
                newObservationPairs.map((pair, i) => (
                  <div key={i}>
                    <input type="text" placeholder="Key (or a title)" value={pair.key} onChange={(e) => handleObservationInputChange(i, 'key', e)} required />
                    <input type="text" placeholder="Value (or a description)" value={pair.value} onChange={(e) => handleObservationInputChange(i, 'value', e)} required />
                    <button type='button' onClick={(e) => deleteNewObservationPair(i)}>Delete</button>
                  </div>
                ))
              }

              <br />
              <button type='button' onClick={addNewObservationPair}>Add a new observation</button>
              </label><br />
              <Button variant="primary" type="submit">Submit</Button>
            </form>
            </Col>
        </Row>
      </Container>
    </Container>
  )
}
export default Observation
