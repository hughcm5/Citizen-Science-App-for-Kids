import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {

    const [loggedIn, setLoggedIn] = useState(null);

    useEffect(() => {
        console.log('Attempting to Check login...')

        axios
        .get(process.env.REACT_APP_BACKEND_GATEWAY_URL + '/session', {
            withCredentials: true
        })
 
        .then((response) => {
            const session_data = response.data;
            setLoggedIn(session_data.logged_in);
// for debugging purposes     console.log('response.data: ', session_data)
        })
        .catch((error) => {
            console.error('Failed to get session from the backend:', error);
        });
    }, []);

    const location = useLocation();

    if (loggedIn === null) {
        return <div>Please wait ...</div>
    }

    if (loggedIn === false) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return children;
};

export default PrivateRoute;