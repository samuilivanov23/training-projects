import './App.css';
import React from 'react';
import Home from './Components/Home'
import { Route, BrowserRouter as Router } from '../node_modules/react-router-dom';

class App extends React.Component{

  render(){
    return (
      <div>
        <Router>
          <Route exact path={"/"} render={(props) => <Home per_page={20}/>} />
        </Router>          
      </div>
    );
  }
}

export default App;