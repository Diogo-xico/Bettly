import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { NavBar } from './components/NavBar'
import { BottomNav } from './components/BottomNav'
import { Login } from './pages/Login'
import { MyBets } from './pages/MyBets'
import { Leaderboard } from './pages/Leaderboard'
import { Admin } from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen pb-20">
          <NavBar />
          <main className="mx-auto max-w-2xl px-4 py-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MyBets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
