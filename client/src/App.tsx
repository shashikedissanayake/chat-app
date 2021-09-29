import React from 'react';
import LoginComponent from './componets/LoginComponent';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import UserContextProvider from './contexts/UserContext';
import HomeComponent from './componets/HomeComponet';
import ChatContextProvider from './contexts/ChatContext';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Chat app</h1>
        <Switch>
          <UserContextProvider>
            <ChatContextProvider>
              <Route exact path="/"><HomeComponent /></Route>
            <Route exact path="/login"><LoginComponent /></Route>
            </ChatContextProvider>
          </UserContextProvider>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
