import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import "./assets/scss/black-dashboard-react.scss";
// import "./assets/demo/demo.css";
// import "./assets/css/nucleo-icons.css";
// import "@fortawesome/fontawesome-free/css/all.min.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
