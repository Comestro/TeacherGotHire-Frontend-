import { StrictMode } from 'react'
import { PersistGate } from "redux-persist/integration/react";
import { createRoot } from 'react-dom/client'
import { persistor } from "./store/store.js";
import './index.css'
import 'katex/dist/katex.min.css';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      <App />
    </PersistGate>
  </StrictMode>,
)
