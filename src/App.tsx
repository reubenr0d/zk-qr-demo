import { Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import CreatePage from './pages/CreatePage'
import VerifyPage from './pages/VerifyPage'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/create" replace />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App