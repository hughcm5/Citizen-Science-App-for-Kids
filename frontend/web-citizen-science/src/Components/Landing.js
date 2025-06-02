/* Landing aka Log-In Page for the Admin Website */

/* ------------ Necessary Imports ------------*/
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import axios from "axios";

/* ------------ Page Content  ------------*/
function Landing() {
  const [CLIENT_ID, setCLIENT_ID] = useState('')
  const [CLIENT_SECRET, setCLIENT_SECRET] = useState('')
  const [user, setUser] = useState(null)
  const [sessionInfo, setSessionInfo] = useState(null)
  const navigate = useNavigate();

  const onOAuthLogin = () => {
    window.open(process.env.REACT_APP_BACKEND_GATEWAY_URL + "/login");
  }

  const onOAuthLogout = () => {
    window.open(process.env.REACT_APP_BACKEND_GATEWAY_URL + "/logout");
  }

  const onSessionGet = () => {
    axios
      .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + "/session")
      .then((response) => {
        console.log('Successfully retrieved session info from the backend');
        setSessionInfo(response.data);
      })
      .catch((err) => {
        console.error('Failed to retrieve session info from the backend: ', err);
      });
  }

  useEffect(() => {
  }, []);

    return (
      <section>
        <Container fluid>
          <Container className="pagecontent">
            <Row>
              <Col md={9}>
              <h1 style={{padding:'2px'}}>Please log in to access the Admin Database</h1>
                <Button style={{fontSize:'20px', margin:'1%', padding:'20px', float:'center'}} onClick={(e) => onOAuthLogin()}>Login</Button>
                <Button style={{fontSize:'20px', margin:'1%', padding:'20px', float:'right'}} onClick={(e) => onOAuthLogout()}>Logout</Button>
                { /* 
                <Button onClick={(e) => onSessionGet()}>OAuth Get Session Info</Button>
                */ }
                {
                /*
                  sessionInfo !== null &&
                    (<div>
                      {JSON.stringify(sessionInfo, null, 2)}
                    </div>)
                */ }
              </Col>
            </Row>
          </Container>
        </Container>
      </section>
    )
  }
  export default Landing