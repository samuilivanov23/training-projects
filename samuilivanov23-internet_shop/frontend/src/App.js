import './App.css'
import React from 'react'
import { useState } from 'react'
import Home from './Components/Home'
import NavigationBar from './Components/NavigationBar'
import Register from './Components/Register'
import { Route, BrowserRouter as Router } from '../node_modules/react-router-dom';

function App (props) {
  return(
    <div>
      <Router>
        <Route path={"/"} render={(props) => <NavigationBar/>} />
        <Route path={"/products"} render={(props) => <Home per_page={20}/>} />
        <Route path={"/register"} render={(props) => <Register/>} />
      </Router>      
    </div>
  );
}

export default App;