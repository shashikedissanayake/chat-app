import React from 'react';
import LoginComponent from './componets/LoginComponent';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import UserContextProvider from './contexts/UserContext';
import HomeComponent from './componets/HomeComponet';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Chat app</h1>
        <Switch>
          <UserContextProvider>
            <Route exact path="/"><HomeComponent /></Route>
          <Route exact path="/login"><LoginComponent /></Route>
          </UserContextProvider>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
