import React, { useEffect, useState } from 'react'
import {
  CButton,
  CContainer,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilSave, cilList, cilFolderOpen } from '@coreui/icons'

// APIs
import {
  getDepartmentsRequest,
  createDepartmentRequest,
  deleteDepartmentRequest,
} from '../../api/department.api.js'
import {
  getCategoriesRequest,
  createCategoryRequest,
  deleteCategoryRequest,
} from '../../api/category.api.js'

const Catalog = () => {
  const azulVA = '#002d72'
  const verdeVA = '#58cc7d'
  const [isDarkMode, setIsDarkMode] = useState(false)

  // --- SINCRONIZACIÓN DE TEMA ---
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-coreui-theme')
      setIsDarkMode(theme === 'dark')
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-coreui-theme'],
    })
    return () => observer.disconnect()
  }, [])

  // --- PALETA DE COLORES ---
  const colors = {
    cardBg: isDarkMode ? '#212631' : '#ffffff',
    text: isDarkMode ? '#ffffff' : azulVA,
    subText: isDarkMode ? '#a0a0a0' : '#4f5d73',
    border: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,45,114,0.1)',
    tableHead: isDarkMode ? '#2d333f' : '#ebedef',
    inputBg: isDarkMode ? '#2a303d' : '#ffffff',
  }

  // --- ESTADOS DE DATOS ---
  const [departments, setDepartments] = useState([])
  const [categories, setCategories] = useState([])
  const [toasts, setToasts] = useState([])

  const [deptForm, setDeptForm] = useState({ name: '', description: '' })
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    id_department: '',
  })

  // --- CARGA DE DATOS CON PROMISE.ALLSETTLED ---
  const loadAllData = async () => {
    try {
      const results = await Promise.allSettled([getDepartmentsRequest(), getCategoriesRequest()])

      // Manejo de Departamentos (Índice 0)
      if (results[0].status === 'fulfilled') {
        setDepartments(Array.isArray(results[0].value.data) ? results[0].value.data : [])
      } else {
        console.error('Error en Departamentos:', results[0].reason)
        setDepartments([])
        showToast('danger', 'No se pudieron cargar los departamentos')
      }

      // Manejo de Categorías (Índice 1)
      if (results[1].status === 'fulfilled') {
        setCategories(Array.isArray(results[1].value.data) ? results[1].value.data : [])
      } else {
        console.error('Error en Categorías:', results[1].reason)
        setCategories([])
        // Si hay un error 500 en categorías, mostramos el aviso pero la app sigue viva
        showToast('danger', 'Error de servidor en categorías (500)')
      }
    } catch (err) {
      showToast('danger', 'Error crítico al sincronizar datos')
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const showToast = (type, message) =>
    setToasts((prev) => [...prev, { id: Date.now(), type, message }])

  // --- HANDLERS ---
  const handleCreateDept = async () => {
    if (!deptForm.name.trim()) return showToast('danger', 'El nombre es obligatorio')
    try {
      await createDepartmentRequest({
        name_departament: deptForm.name,
        description: deptForm.description,
      })
      showToast('success', 'Departamento creado')
      setDeptForm({ name: '', description: '' })
      loadAllData()
    } catch (err) {
      showToast('danger', 'Error al crear departamento')
    }
  }

  const handleCreateCat = async () => {
    if (!catForm.name.trim() || !catForm.id_department) {
      return showToast('danger', 'Nombre y Departamento son obligatorios')
    }
    try {
      await createCategoryRequest({
        name_category: catForm.name,
        description: catForm.description,
        id_department: catForm.id_department,
      })
      showToast('success', 'Categoría registrada')
      setCatForm({ name: '', description: '', id_department: '' })
      loadAllData()
    } catch (err) {
      showToast('danger', 'Error al crear categoría')
    }
  }

  return (
    <CContainer fluid className="px-4 pb-4">
      <style>
        {`
          .catalog-card { background: ${colors.cardBg} !important; border-radius: 20px; border: 1px solid ${colors.border}; color: ${colors.text}; transition: all 0.3s ease; }
          .catalog-table thead th { background-color: ${colors.tableHead} !important; color: ${colors.text}; font-size: 11px; text-transform: uppercase; border: none; }
          .catalog-table td { border-bottom: 1px solid ${colors.border} !important; color: ${isDarkMode ? '#d0d0d0' : '#4f5d73'} !important; }
          .custom-input, .custom-select { background-color: ${colors.inputBg} !important; color: ${colors.text} !important; border: 1px solid ${colors.border} !important; }
          .custom-input:focus, .custom-select:focus { box-shadow: 0 0 0 0.25rem rgba(88, 204, 125, 0.25); border-color: ${verdeVA} !important; }
          label { color: ${colors.subText}; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; }
        `}
      </style>

      <CToaster position="top-end">
        {toasts.map((t) => (
          <CToast
            key={t.id}
            autohide
            delay={3000}
            color={t.type === 'success' ? 'success' : 'danger'}
            className="text-white"
          >
            <CToastHeader closeButton>
              <strong>Sistema VA</strong>
            </CToastHeader>
            <CToastBody className="fw-bold">{t.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>

      <div className="mt-4 mb-4">
        <h3 className="fw-bold mb-0" style={{ color: colors.text }}>
          Configuración de <span style={{ color: verdeVA }}>Catálogos</span>
        </h3>
        <p className="small mb-0" style={{ color: colors.subText }}>
          Gestión jerárquica de Departamentos y Categorías
        </p>
      </div>

      <CRow className="g-4">
        <CCol lg={6}>
          <div className="catalog-card p-4 shadow-sm h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center">
              <CIcon icon={cilFolderOpen} className="me-2 text-info" /> Departamentos
            </h5>
            <div
              className="mb-4 p-3 rounded-3"
              style={{
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,45,114,0.03)',
              }}
            >
              <CRow className="g-3">
                <CCol md={12}>
                  <label>Nombre del Departamento</label>
                  <CFormInput
                    className="custom-input"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  />
                </CCol>
                <CCol md={12}>
                  <label>Descripción Corta</label>
                  <CFormTextarea
                    className="custom-input"
                    rows={2}
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  />
                </CCol>
                <CCol md={12} className="text-end">
                  <CButton
                    style={{ backgroundColor: azulVA, borderColor: azulVA }}
                    className="text-white px-4 rounded-pill fw-bold"
                    onClick={handleCreateDept}
                  >
                    <CIcon icon={cilSave} className="me-2" /> Guardar
                  </CButton>
                </CCol>
              </CRow>
            </div>
            <div className="table-responsive">
              <CTable align="middle" borderless className="catalog-table mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell className="ps-3">ID</CTableHeaderCell>
                    <CTableHeaderCell>Departamento</CTableHeaderCell>
                    <CTableHeaderCell className="text-end pe-3">Acción</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {departments.map((d) => (
                    <CTableRow key={d.id_department}>
                      <CTableDataCell className="ps-3 fw-bold" style={{ color: azulVA }}>
                        #{d.id_department}
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-bold text-capitalize">{d.name_departament}</div>
                        <div className="small opacity-75">{d.description || 'Sin descripción'}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-end pe-3">
                        <CButton
                          variant="ghost"
                          color="danger"
                          size="sm"
                          onClick={() => deleteDepartmentRequest(d.id_department).then(loadAllData)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </div>
        </CCol>

        <CCol lg={6}>
          <div className="catalog-card p-4 shadow-sm h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center">
              <CIcon icon={cilList} className="me-2 text-success" /> Categorías
            </h5>
            <div
              className="mb-4 p-3 rounded-3"
              style={{
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,45,114,0.03)',
              }}
            >
              <CRow className="g-3">
                <CCol md={12}>
                  <label>Departamento Padre</label>
                  <CFormSelect
                    className="custom-select"
                    value={catForm.id_department}
                    onChange={(e) => setCatForm({ ...catForm, id_department: e.target.value })}
                  >
                    <option value="">Seleccione Departamento...</option>
                    {departments.map((dept) => (
                      <option key={dept.id_department} value={dept.id_department}>
                        {dept.name_departament}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={12}>
                  <label>Nombre de Categoría</label>
                  <CFormInput
                    className="custom-input"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  />
                </CCol>
                <CCol md={12} className="text-end">
                  <CButton
                    style={{ backgroundColor: verdeVA, borderColor: verdeVA }}
                    className="text-dark px-4 rounded-pill fw-bold"
                    onClick={handleCreateCat}
                  >
                    <CIcon icon={cilSave} className="me-2" /> Registrar
                  </CButton>
                </CCol>
              </CRow>
            </div>
            <div className="table-responsive">
              <CTable align="middle" borderless className="catalog-table mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell className="ps-3">ID</CTableHeaderCell>
                    <CTableHeaderCell>Categoría</CTableHeaderCell>
                    <CTableHeaderCell>Pertenece A</CTableHeaderCell>
                    <CTableHeaderCell className="text-end pe-3">Acción</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {categories.map((c) => (
                    <CTableRow key={c.id_category}>
                      <CTableDataCell className="ps-3 fw-bold" style={{ color: azulVA }}>
                        #{c.id_category}
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-bold text-success text-capitalize">
                          {c.name_category}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <span
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: isDarkMode ? '#2d333f' : '#f0f0f0',
                            color: colors.text,
                          }}
                        >
                          {c.name_departament || 'Dpt. ID: ' + c.id_department}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell className="text-end pe-3">
                        <CButton
                          variant="ghost"
                          color="danger"
                          size="sm"
                          onClick={() => deleteCategoryRequest(c.id_category).then(loadAllData)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Catalog
