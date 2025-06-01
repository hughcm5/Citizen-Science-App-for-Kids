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

  const [classes, setClasses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [observations, setObservations] = useState([]);

  const [editedId, setEditedId] = useState(null);
  const [editedObservation, setEditedObservation] = useState({});

    /* Prepare the retrieve on the frontend */
  const [loading, setLoading] = useState(true);
  const [retrieveError, setRetrieveError] = useState(null);


  /* ------------ Helpers  ------------*/
  const toHumanReadableDate = (backendDateStr) => {
    const date = new Date(backendDateStr);
    // Format the string to remove timezone 
    return date.toISOString().split('T')[0];
  }

  const getClassNameFromId = (id) => {
    const classFound = classes.find(c => c.class_id == id);
    if (classFound) {
      return classFound.class_name;
    } else {
      return "Unknown";
    }
  }


  /* ------------ Retrieve  ------------*/
  const fetchClasses = async () => {
    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + "/classrooms")
      .then((response) => {
        const classroom_data = response.data;
        setClasses(classroom_data);
      })
      .catch((err) => {
        console.log('Failed to fetch classroom data');
        console.log(err);
      });
  }

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

        fetchAll();
      })
      .catch((err) => {
        console.error('Failed to post observation');
        console.error(err);

        fetchAll();
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

  const deleteObservation = (id) => {
    axios
      .delete(process.env.REACT_APP_BACKEND_GATEWAY_URL + "/observations/" + id.toString())
      .then((response) => {
        console.log('Observation delete successful');
        console.log(response);

        fetchAll();
      })
      .catch((err) => {
        console.error('Failed to delete observation');
        console.error(err);

        fetchAll();
      });
  }

  const onEditRow = (event, observation) => {
    // enable the labels by setting an edited id to render the inputs
    setEditedId(observation.observation_id);

    const obsDataJsonStr = JSON.stringify(observation['observation data'], null, 2)
    const obsCopy = {...observation, ['observation data']: obsDataJsonStr};

    setEditedObservation(obsCopy);

    // Auto resize textareas
    const tablerow = event.target.closest('tr');
    const textareas = tablerow.getElementsByTagName("textarea");
    for (const textarea of textareas) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

  const onEditChange = (x) => {
    const { name, value } = x.target;
    setEditedObservation({...editedObservation, [name]: value});
  }

  const cancelEdit = () => {
    setEditedId(null);
    setEditedObservation({});
  }

  const onSaveEdit = async () => {
    if (!editedId) {
      // If nothing was edited, do nothing
      return;
    }

    // TODO: Maybe do some frontend validation to catch mistakes before sending to the backend?

    let observation_json = {}
    try {
      observation_json = JSON.parse(editedObservation['observation data']);
    } catch (error) {
      console.log("observation data field is malformed. Please make sure it is a properly JSON formatted");
      return;
    }

    const project_id_int = parseInt(editedObservation.project_id);
    const student_id_int = parseInt(editedObservation.student_id);

    const observationPayload = {
      'project_id': project_id_int,
      'student_id': student_id_int,
      'observation_data': observation_json
    }

    axios
      .put(process.env.REACT_APP_BACKEND_GATEWAY_URL + "/observations/" + editedId.toString(), observationPayload)
      .then((response) => {
        console.log('Observation update successful');
        console.log(response);

        // A bit of an oxymoron since the edit was already successful but this is to disable the edit fields
        cancelEdit();

        // Refresh the data
        fetchAll();
      })
      .catch((err) => {
        console.error('Failed to update observation');
        console.error(err);

        fetchAll();
      });
  }

  const fetchAll = () => {
    fetchClasses();
    fetchProjects();
    fetchStudents();
    fetchObservations();
  }

  useEffect(() => {
    fetchAll();
  }, []);

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
        <Row>
          <Col md={9}>
            <h1 style={{paddingBottom: '40px'}}>
              Each project has a collection of observations made by the students in a class
            </h1>
            <h2>Current Observations:</h2>
            { /* ( <pre>{JSON.stringify(observations, null, 2)}</pre> ) */ }
            {/* 
            <select
            value={class_id}
            onChange={e => setclass_id(e.target.value)}
            >
            {classrooms.map(classroom => (
              <option value={classroom.class_id}>{classroom.class_name + ' (' + classroom.class_id + ')'}</option>
            ))}
              </select>
                 */ }
            <table style={tableStyle}>
            <thead>
              <tr>
                <th></th>
                <th>Class</th>
                <th>Project</th>
                <th>Student</th>
                <th>Observations</th>
                <th>Created At</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                observations.map(observation => (
                  <tr key={observation.observation_id}>
                    <td>
                        {
                          editedId === observation.observation_id
                          ? (<>
                              <button onClick={() => cancelEdit()}>Cancel</button>
                              <button onClick={() => onSaveEdit()}>Save</button>
                            </>)
                          : (<button onClick={(e) => onEditRow(e, observation)}>Edit</button>)
                        }
                    </td>
                    <td>{getClassNameFromId(observation['student class id']) + ' (' + observation['student class id'] + ')'}</td>
                    <td>
                      {
                        editedId === observation.observation_id
                        ? (<select
                            name='project_id'
                            value={editedObservation.project_id}
                            onChange={onEditChange}
                            >
                            {projects.map(project => (
                              <option value={project.project_id}>{project.project_title + ' (' + project.project_id.toString() + ')'}</option>
                            ))}
                          </select>)
                        : observation['project title'] + ' (' + observation.project_id + ')'
                      }
                    </td>
                    <td>
                      {
                        editedId === observation.observation_id
                        ? (<select
                            name='student_id'
                            value={editedObservation.student_id}
                            onChange={onEditChange}
                            >
                            {students.map(student => (
                              <option value={student.student_id}>{student.student_lastname + ', ' + student.student_firstname + ' (' + student.student_id.toString() + ')'}</option>
                            ))}
                          </select>)
                        : observation['student lastname'] + ', ' + observation['student firstname'] + ' (' + observation.student_id + ')'
                      }
                    </td>
                    <td>
                      {
                        editedId === observation.observation_id
                        ? (<textarea
                            name='observation data'
                            value={editedObservation['observation data']}
                            onChange={onEditChange}
                            />)
                        : JSON.stringify(observation['observation data'], null, 2)
                      }
                    </td>
                    <td>{toHumanReadableDate(observation.created_at)}</td>
                    <td>{toHumanReadableDate(observation.updated_at)}</td>
                    <td>
                      <button onClick={(e) => deleteObservation(observation.observation_id)}>Delete</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>

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
