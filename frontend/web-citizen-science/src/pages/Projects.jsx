/* Tailors the data for the View Project Page on the Admin Website */

/* ------------ Necessary Imports ------------*/
import { React, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import DataTable from '../components/DataTable';

/* ------------ Project Table ------------*/
export default function Projects({getRows, getCol}) {
  const path = 'projects'
  const [rows, setRows] = useState([]);
  const [selectVals, setSelectVals] = useState({});

  /* tailor columns for its corresponding entity*/
  const columns = [
    {
      field: 'project_id',          /* <--- MUST match backend perfectly! */
      headerName: 'Project Id',     /* <--- Displays for user */
      width: 220,
      editable: false,              /* <--- PKs CANNOT be editable */
    },
        {
    /* set this up to display foreign keys */
      field: 'class_id',
      headerName: 'Class ID',
      width: 220,
      editable: true,
      type: 'singleSelect',
      valueOptions: selectVals.classrooms,          
    },
    {
      field: 'project_title',
      headerName: 'Project Title',
      width: 220,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 220,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
    field: 'created_at',           
    headerName: 'Created At',
    width: 220,
    align: 'left',
    headerAlign: 'left',
    editable: true,
  },
  {
    field: 'project_settings',
    headerName: 'Project Settings',
    width: 220,
    align: 'left',
    headerAlign: 'left',
    editable: true,
  },
  ]; 

  /* Tailoring payloads for the front end to extract data from the backend's queries */
  const onInsert = async (newRow) => {
    try {
      const res = await axios.post(

        /* Insert prompts the CREATE query from the backend */
        /* This translates as a POST to the frontend's UI */
        process.env.REACT_APP_API_URL + path,
        {
          project_title: newRow.project_title,
          title: newRow.title,
          description: newRow.description,
          created_at: newRow.created_at,
          project_settings: newRow.project_settings
        },
      )
    }
    catch (error) {
      alert(
        `INSERT: Failed request to server. Status code: ${error.response.status}.
        See http response for more information.`
      );
      return 1;
    }
    finally {
      const rows = await getRows(path);
      setRows([...rows]);
    }
    const rows = await getRows(path);
    setRows([...rows]);
    return 0;
  };

  const onUpdate = async (newRow, oldRow) => {
    try {
      const res = await axios.put(
        process.env.REACT_APP_API_URL + path,
        {
          updateProj:
          {
            project_id: oldRow.project_id
          },
          updateVals:
          {
            project_title: newRow.project_title,
            title: newRow.title,
            description: newRow.description,
            created_at: newRow.created_at,
            project_settings: newRow.project_settings
          },
        }
      )
    }
    catch (error) {
      alert(
        `UPDATE: You can do that better than that. Status code: ${error.response.status}.
        See http response for more information.`
      );
      return 1;
    }
    finally {
      const rows = await getRows(path);
      setRows([...rows]);
    }
    const rows = await getRows(path) ;
    setRows([...rows]);
    return 0;
  };

  const onDelete = async (row) => {
    try {
      const res = await axios.delete(
        process.env.REACT_APP_API_URL + path,
        {
          data: {
            deleteProj: {
              project_id: row.project_id
            }
          }
        }
      );
    }
    catch (error) {
      alert(`DELETE: Failed request to server. Status code: ${error.reponse.status}`);
      return 1;
    }
    finally {
      const rows = await getRows(path) ; 
      setRows([...rows]);
    }
    const rows = await getRows(path);
    setRows([...rows]);
    return 0;
  };
  useEffect(() => {
    (
      async() => {
        setRows(await getRows(path));
        const o = {}
        selectVals.project_id = await getCol('projects/project_id');
        /*
        selectVals.project_id = await getCol('projects/project_id');
        reuse for other entities when they are on the backend
        */
        setSelectVals({...selectVals});
      })();
    }, []);
  return (
    <>
    {<Link to={"/"}>Home</Link>}
    <h1>Projects</h1>
    {rows.length > 0 && <DataTable rows={rows} setRows={setRows} columns={columns} onInsert={onInsert} onUpdate={onUpdate} onDelete={onDelete} />}
    </>
  ) ;
  }

