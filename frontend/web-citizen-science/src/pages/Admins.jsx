/* Tailors the data for the Admins Page on the Admin Website */

/* ------------ Necessary Imports ------------*/
import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import DataTable from './components/DataTable';
/* ------------ Admin Table ------------*/
export default function Admins({getRows, getCol}) {
  const path = 'admins'
  const [rows, setRows] = useState([]);
  const [selectVals, setSelectVals] = useState({});

/* Prepare the data by setting up the columns */
  const columns = [
  /* Each column's field must match the backend perfectly! */
    {
      field: 'admin_id',
      headerName: 'Admin ID',
      width: 220,
      editable: false,  /* <--- PKs CANNOT be editable */
      type: 'integer'           
    },
    {
      field: 'admin_firstname',
      headerName: 'First Name',
      width: 220,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'admin_lasttname',
      headerName: 'Last Name',
      width: 220,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 220,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 220,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
  ];
      /*
   * Tailor the payload passed on each axios call in
   * onInsert, onUpdate, and onDelte to each corresponding table.
  */
  const onInsert = async (newRow) => {
    try {
      const res = await axios.post(
        process.env.REACT_APP_API_URL + path,
          {
            admin_id: newRow.admin_id,
            admin_firstname: newRow.admin_firstname,
            admin_lastname: newRow.admin_lastname,
            email: newRow.email,
            role: newRow.role,
          }
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

    /* Update will call the backend to INSERT and then DataTable will update for the frontend */
  const onUpdate = async (newRow, oldRow) => {
    try {
      const res = await axios.put(
        process.env.REACT_APP_API_URL + path,
        {
          updateCond:
            {
              admin_id: oldRow.admin_id,
            },
          updateVals:
            {
              admin_firstname: newRow.admin_firstname,
              admin_lastname: newRow.admin_lastname,
              email: newRow.email,
              role: newRow.role,         
            }
        }
      )
    }
    catch (error) {
      alert(
        `UPDATE: Oops- Failed request to server. Status code: ${error.response.status}.
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

    /* Delete will call the backend to DELETE and then DataTable will update for the frontend */
  const onDelete = async (row) => {
    try {
      const res = await axios.delete(
        process.env.REACT_APP_API_URL + path,
        {
          data: {
            deleteCond: {
              admin_id: row.admin_id
            }
          }
        }
      );
    }
    catch (error) {
      alert(`DELETE: Failed request to server. Status code: ${error.response.status}`);
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

  /* universal SELECT query for all of the tables, with the exception of the intersection tables (they will be the union of their many-many relationship) */
  useEffect(() => {
    (async () => {
      setRows(await getRows(path));
      const o = { }
      selectVals.admin_id = await getCol('Admins/admin__id');
      selectVals.name = await getCol('Projects/Name');
      setSelectVals({...selectVals});
    })();
  }, []);

  return (
    <>
    {<Link to={"/"}>Home</Link>}
    <h1>Admins</h1>
    {rows.length > 0 && <DataTable rows={rows} setRows={setRows} columns={columns} onInsert={onInsert} onUpdate={onUpdate} onDelete={onDelete} />}
    </>
  );
}
