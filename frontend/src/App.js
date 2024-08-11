import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import InsertPage from './InsertPage'; 
import PlayPage from './PlayPage';     

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/insert" element = {<InsertPage />} />
                <Route path="/play" element = {<PlayPage />} />
            </Routes>
        </Router>
    );
};

export default App;