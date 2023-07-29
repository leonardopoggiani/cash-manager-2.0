import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

// Render the App component inside the Router
ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);