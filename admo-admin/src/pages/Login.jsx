import { useState } from "react"

export default function Login() {

const ADMIN_USER =
  import.meta.env.VITE_ADMIN_USER;

const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD;

  const [username,setUsername] =
    useState("")

  const [password,setPassword] =
    useState("")

  const login = () => {

if(
  username === ADMIN_USER &&
  password === ADMIN_PASSWORD
){

      localStorage.setItem(
        "loggedin",
        "true"
      )

      window.location =
        "/campaigns"
    }
    else{
      alert("Invalid Login")
    }
  }

  return (

    <div style={{
      width:"300px",
      margin:"100px auto"
    }}>

      <h2>AdMediaOne Admin</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e)=>
          setUsername(
            e.target.value
          )
        }
      />

      <br/><br/>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>
          setPassword(
            e.target.value
          )
        }
      />

      <br/><br/>

      <button
        onClick={login}
      >
        Login
      </button>

    </div>
  )
}
