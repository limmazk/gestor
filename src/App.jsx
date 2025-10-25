import './App.css'
import { useState, useEffect } from 'react'
import Pages from "@/pages/index.jsx"
import Login from "@/pages/Login.jsx"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  if (isLoading) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      {currentUser ? (
        <>
          <Pages onLogout={handleLogout} />
          <Toaster />
        </>
      ) : (
        <>
          <Login onLogin={handleLogin} />
          <Toaster />
        </>
      )}
    </QueryClientProvider>
  )
}

export default App 