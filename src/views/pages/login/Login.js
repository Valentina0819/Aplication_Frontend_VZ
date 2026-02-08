  import React, { useState } from 'react'
  import { Link, useNavigate } from 'react-router-dom'
  import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
    CToaster,
    CToast,
    CToastHeader,
    CToastBody,
  } from '@coreui/react'
  import CIcon from '@coreui/icons-react'
  import { cilLockLocked, cilUser } from '@coreui/icons'

  import logoPersonalizado from '../../../assets/images/3512698.png'

  const Login = () => {

    const navigate = useNavigate()

    // ---------- TOAST ----------
    const [toasts, setToasts] = useState([])
    const showToast = (type, message) => {
      setToasts((prev) => [...prev, { id: Date.now(), type, message }])
    }

    // ---------- FORM ----------
    const [formData, setFormData] = useState({
      username: '',
      password: '',
    })

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      })
    }

    const API = 'http://localhost:4000/users'

    // ---------- LOGIN ----------
    const loginUser = async () => {
      const { username, password } = formData

      if (!username || !password) {
        showToast('danger', 'Todos los campos son obligatorios')
        return
      }

      try {
      const res = await fetch(`${API}?username=${username}`)
      const data = await res.json()


      const user = data.find(u => u.password === password)
      if (user) {
        localStorage.setItem("user", JSON.stringify(user))
        showToast("success", `Bienvenido ${user.username}`)
        setTimeout(() => navigate("/dashboard"), 1000)
      } else {
        showToast("danger", "Usuario o contraseña incorrectos")
      }
      } catch (error) {
        console.error(error)
        showToast('danger', 'Error conectando con el servidor')
      }
    }

    return (
      <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={6}>
              <CCard className="p-4">
                <CCardBody className="d-flex flex-column align-items-center">
                  <img
                    src={logoPersonalizado}
                    height={60}
                    alt="Logo personalizado"
                    className="mb-4"
                  />

                  <CForm className="w-100">
                    <h1 className="text-center">Login</h1>
                    <p className="text-body-secondary text-center">
                      Sign In to your account
                    </p>

                    {/* Username */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="username"
                      />
                    </CInputGroup>

                    {/* Password */}
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                      />
                    </CInputGroup>

                    {/* Buttons */}
                    <CRow className="mb-3">
                      <CCol xs={6}>
                        <CButton color="primary" className="w-100" onClick={loginUser}>
                          Login
                        </CButton>
                      </CCol>

                      <CCol xs={6}>
                        <Link to="/users">
                          <CButton color="secondary" className="w-100">
                            Register Now!
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>

                    {/* Forgot password */}
                    <div className="text-end">
                      <CButton color="link" className="px-0">
                        Forgot password?
                      </CButton>
                    </div>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          {/* TOAST */}
          <CToaster placement="top-end">
            {toasts.map((t) => (
              <CToast key={t.id} autohide delay={2600} color={t.type} visible>
                <CToastHeader closeButton>
                  <strong>{t.message}</strong>
                </CToastHeader>
                <CToastBody>Operación realizada correctamente.</CToastBody>
              </CToast>
            ))}
          </CToaster>
        </CContainer>
      </div>
    )
  }

  export default Login
