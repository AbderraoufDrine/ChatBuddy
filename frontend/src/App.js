import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Home from './Pages/Home'
import Chat from './Pages/Chat'

import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/chats" element={<Chat/>}/>
      </Routes>
    </div>
  );
}

export default App;
