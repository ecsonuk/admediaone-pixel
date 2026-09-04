import {
  BrowserRouter,
  Routes,
  Route
}
from "react-router-dom"

import Login
from "./pages/Login"

import Campaigns
from "./pages/Campaigns"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

<Route
  path="/campaigns"
  element={
    localStorage.getItem("loggedin")
      ? <Campaigns />
      : <Login />
  }
/>

      </Routes>

    </BrowserRouter>

  )
}

export default App
