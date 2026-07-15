import { createContext, useContext, useState } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [username, setUsername] = useState('')

  return (
    <UserContext.Provider value={{ username, setUsername }}>{children}</UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used inside a <UserProvider>')
  }
  return ctx
}
