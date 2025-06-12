import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './style.css'

ReactDOM.createRoot(document.getElementById('app')).render(
    <HashRouter>
      <App />
    </HashRouter>
)