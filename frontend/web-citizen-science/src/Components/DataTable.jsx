/* Tailors the table(s) for data on the Admin Website */

/* ------------ References ------------*/
// adapted from https://github.com/mui/mui-x/blob/v7.12.1/docs/data/data-grid/editing/FullFeaturedCrudGrid.js

/* ------------ Necessary Imports ------------*/
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button } from 'react-native';
import { DataTable } from 'react-native-datatable-component';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from 'react-bootstrap/Form';

/* ------------ Populate the Table's Contents ------------*/
const ProjectsTable = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://localhost3000=${page}`);
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView>
      <View>
        {data.map((row, index) => (
          <View key={index} style={{ flexDirection: 'row' }}>
            <Text style={{ flex: 1 }}>{row.column1}</Text>
            <Text style={{ flex: 1 }}>{row.column2}</Text>
            <Text style={{ flex: 1 }}>{row.column3}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Button title="Previous" onPress={handlePrevPage} disabled={page === 1} />
        <Button title="Next" onPress={handleNextPage} />
      </View>
    </ScrollView>
  );
};

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = id();
    setRows((oldRows) => [...oldRows, { id, name: '', project: '', isNew: true }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: setRows.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <Container>
      <Button color="primary" onClick={handleClick}>
        Add record
      </Button>
    </Container>
  );
}

/* ------------ Create Retrieve Update Delete  ------------*/
export default function FullFeaturedCrudGrid({rows, setRows, columns, onInsert, onUpdate, onDelete}) {
  const [newRows, setNewRows] = React.useState({});
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [isEdit, setIsEdit] = React.useState(false)

  const handleRowEditStop = (params, event) => {
    if (params.reason === isEdit.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: isEdit.Edit } });
    setIsEdit()
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: setNewRows.View } });
  };

  const handleDeleteClick = (id) => async () => {
    const row = rows.find((row) => row.id === id);
    if (onDelete(row) !== 0) return;
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: newRows.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow, oldRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    if (newRow.isNew) {
      onInsert(newRow)
    }
    else {
      onUpdate(newRow, oldRow);
    }
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  columns = [
    ...columns,
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === setIsEdit.Edit;

        if (isInEditMode) {
          return [
            <Container
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <Container
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <Container
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <Container
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Container
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      <Container
        rows={rows}
        columns={columns}
        columnVisibilityModel={{
          //* Default visability is none aka.false until authentication and key lookup is prompted
          project_id: false,   
          observation_id: false,      
          class_id: false,
          admin_id: false,    
          student_id: false, 
        }}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
      />
    </Container>
  );
}
