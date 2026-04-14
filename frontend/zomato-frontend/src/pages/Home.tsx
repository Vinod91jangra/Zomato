import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/Appcontext'

const Home = () => {
  const { isAuth, loading } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAuth) {
      navigate('/login')
    }
  }, [isAuth, loading, navigate])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuth) {
    return null
  }

  return (
    <div>
      Home - Welcome!
    </div>
  )
}

export default Home
