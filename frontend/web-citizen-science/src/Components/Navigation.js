import React, { useState } from "react";
import { Link } from "react-router-dom";

/*Import Components from react-bootstrap */
import Navbar from "react-bootstrap/Navbar"
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

function Navigation() {
  return (
    <Navbar
        fixed="top"
        expand="md"
        className="blue-navbar"
    > 
        <Container className="navbar-styles">
        <Nav.Item >
              <Nav.Link as={Link} to="/" >
                About Us
              </Nav.Link>
        </Nav.Item>
        <Nav.Item >
              <Nav.Link as={Link} to="/Landing" >
                Home
              </Nav.Link>
        </Nav.Item>
        <Nav.Item >
              <Nav.Link as={Link} to="/Viewprojects" >
                Projects
              </Nav.Link>
        </Nav.Item>
        <Nav.Item >
              <Nav.Link as={Link} to="/createproject" >
                Create New Project
              </Nav.Link>
        </Nav.Item>
        <Nav.Item >
              <Nav.Link as={Link} to="/admins" >
               Admins
              </Nav.Link>
        </Nav.Item>
        <Nav.Item >
              <Nav.Link as={Link} to="/createclassroom" >
               Classrooms
              </Nav.Link>
        </Nav.Item>
        <Nav.Item >
              <Nav.Link as={Link} to="/createstudent" >
               Students
              </Nav.Link>
        </Nav.Item>
        <Nav.Item >
              <Nav.Link as={Link} to="/createobservation" >
               Observations
              </Nav.Link>
        </Nav.Item>
        </Container>
    </Navbar>
  )
}

export default Navigation