import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CContainer,
  CAvatar,
  CButton,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPencil,
  cilTrash,
  cilCheckCircle,
  cilXCircle,
  cilUserFollow,
  cilFilter,
  cilSearch,
  cilReload,
  cilChevronLeft,
  cilChevronRight,
} from '@coreui/icons'

import {
  getUsersRequest,
  createUserRequest,
  deleteUserRequest,
  updateUserRequest,
  patchUserRequest,
  reactivateUserRequest,
} from '../../api/users.api.js'

export const Users = () => {
  const location = useLocation()

  const verdeVA = '#58cc7d'
  const azulVA = '#002d72'
  const [isDarkMode, setIsDarkMode] = useState(false)

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

  const colors = {
    cardBg: isDarkMode ? '#212631' : '#ffffff',
    text: isDarkMode ? '#ffffff' : azulVA,
    subText: isDarkMode ? '#a0a0a0' : '#4f5d73',
    border: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,45,114,0.1)',
    tableHead: isDarkMode ? '#2d333f' : '#ebedef',
    pagBtn: isDarkMode ? '#2d333f' : '#ffffff',
    pagText: isDarkMode ? '#d0d0d0' : azulVA,
  }

  // --- ESTADOS ---
  const [toasts, setToasts] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [statusModal, setStatusModal] = useState({
    visible: false,
    userId: null,
    currentStatus: '',
  })
  const [deleteModal, setDeleteModal] = useState({ visible: false, userId: null })

  const emptyForm = {
    id_role: '',
    dni: '',
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    user_name: '',
    password: '',
    status: true,
  }
  const [formUser, setFormUser] = useState(emptyForm)

  const showToast = (type, message) =>
    setToasts((prev) => [...prev, { type, message, id: Date.now() }])

  useEffect(() => {
    const isEmployeePage = location.pathname.includes('employees')
    const initialRole = isEmployeePage ? '2' : '3'
    setRoleFilter(initialRole)
    fetchUsers(initialRole)
  }, [location.pathname])

  const fetchUsers = async (roleToFilter) => {
    try {
      const res = await getUsersRequest()
      setAllUsers(res.data)
      applyFilters(res.data, roleToFilter || roleFilter, statusFilter, searchTerm)
    } catch (err) {
      showToast('danger', 'Error al cargar datos')
    }
  }

  const applyFilters = (data, role, status, search) => {
    let result = [...data]
    if (role && role !== 'all') result = result.filter((u) => String(u.id_role) === String(role))
    if (status !== 'all') {
      const target = status === 'active'
      result = result.filter(
        (u) => (u.status === true || u.status === 'active' || u.status === 1) === target,
      )
    }
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.first_name?.toLowerCase().includes(s) ||
          u.last_name?.toLowerCase().includes(s) ||
          u.dni?.includes(s),
      )
    }
    setFilteredUsers(result)
    setCurrentPage(1)
  }

  useEffect(() => {
    applyFilters(allUsers, roleFilter, statusFilter, searchTerm)
  }, [roleFilter, statusFilter, searchTerm])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setRoleFilter(location.pathname.includes('employees') ? '2' : '3')
  }

  // --- CRUD FUNCTIONS ---
  const handleSave = async (e) => {
    e.preventDefault()
    try {
      editingId ? await patchUserRequest(editingId, formUser) : await createUserRequest(formUser)
      showToast('success', 'Éxito')
      setModalVisible(false)
      fetchUsers()
    } catch (err) {
      showToast('danger', 'Error')
    }
  }

  const handleConfirmStatus = async () => {
    try {
      statusModal.currentStatus === 'active'
        ? await patchUserRequest(statusModal.userId, { status: false })
        : await reactivateUserRequest(statusModal.userId)
      showToast('success', 'Estado actualizado')
      fetchUsers()
    } catch (err) {
      showToast('danger', 'Error')
    } finally {
      setStatusModal({ visible: false, userId: null, currentStatus: '' })
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteUserRequest(deleteModal.userId)
      showToast('success', 'Eliminado')
      fetchUsers()
    } catch (err) {
      showToast('danger', 'Error')
    } finally {
      setDeleteModal({ visible: false, userId: null })
    }
  }

  return (
    <CContainer fluid className="px-4 pb-4">
      <style>
        {`
          .main-card-users { background: ${colors.cardBg} !important; border-radius: 20px; border: 1px solid ${colors.border}; color: ${colors.text}; }
          .custom-table thead th { background-color: ${colors.tableHead} !important; color: ${colors.text}; font-size: 11px; text-transform: uppercase; border: none; }
          .custom-table td { border-bottom: 1px solid ${colors.border} !important; color: ${isDarkMode ? '#d0d0d0' : '#4f5d73'} !important; }
          
          /* ESTILOS PERSONALIZADOS DE PAGINACIÓN PARA MODO OSCURO */
          .va-pagination .page-link { 
            background-color: ${colors.pagBtn} !important; 
            border-color: ${colors.border} !important; 
            color: ${colors.pagText} !important;
            box-shadow: none !important;
          }
          .va-pagination .page-item.active .page-link { 
            background-color: ${verdeVA} !important; 
            border-color: ${verdeVA} !important; 
            color: #1d222b !important;
            font-weight: bold;
          }
          .va-pagination .page-item.disabled .page-link {
            background-color: ${isDarkMode ? '#1a1d24' : '#f8f9fa'} !important;
            opacity: 0.5;
          }
          .va-pagination .page-link:hover:not(.active) {
            background-color: ${isDarkMode ? '#3a4253' : '#e9ecef'} !important;
          }
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
              <strong>Notificación</strong>
            </CToastHeader>
            <CToastBody>{t.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>

      <div className="main-card-users p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-0">
              Gestión de <span style={{ color: verdeVA }}>Usuarios</span>
            </h3>
            <p className="small mb-0" style={{ color: colors.subText }}>
              V&A System - Listado General
            </p>
          </div>
          <CButton
            style={{ backgroundColor: azulVA, borderColor: azulVA }}
            className="text-white px-4 py-2 rounded-pill"
            onClick={() => {
              setEditingId(null)
              setFormUser({ ...emptyForm, id_role: roleFilter === 'all' ? '' : roleFilter })
              setModalVisible(true)
            }}
          >
            <CIcon icon={cilUserFollow} className="me-2" /> Nuevo Registro
          </CButton>
        </div>

        <CRow
          className="g-3 mb-4 p-3 rounded-3"
          style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,45,114,0.03)' }}
        >
          <CCol md={4}>
            <CInputGroup>
              <CInputGroupText style={{ backgroundColor: azulVA }} className="border-0 text-white">
                <CIcon icon={cilSearch} />
              </CInputGroupText>
              <CFormInput
                placeholder="Buscar por DNI o Nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CInputGroup>
          </CCol>
          <CCol md={3}>
            <CInputGroup>
              <CInputGroupText style={{ backgroundColor: azulVA }} className="border-0 text-white">
                <CIcon icon={cilFilter} />
              </CInputGroupText>
              <CFormSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">Todos los Roles</option>
                <option value="1">Admin</option>
                <option value="2">Empleado</option>
                <option value="3">Cliente</option>
              </CFormSelect>
            </CInputGroup>
          </CCol>
          <CCol md={3}>
            <CInputGroup>
              <CInputGroupText style={{ backgroundColor: azulVA }} className="border-0 text-white">
                <CIcon icon={cilCheckCircle} />
              </CInputGroupText>
              <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Todos los Estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </CFormSelect>
            </CInputGroup>
          </CCol>
          <CCol md={2}>
            <CButton
              variant="outline"
              color="secondary"
              className="w-100 h-100"
              onClick={resetFilters}
            >
              <CIcon icon={cilReload} className="me-2" />
              Limpiar
            </CButton>
          </CCol>
        </CRow>

        <div className="table-responsive">
          <CTable align="middle" className="custom-table mb-0" hover responsive>
            <CTableHead>
              <CTableRow className="text-nowrap">
                <CTableHeaderCell className="ps-4">ID</CTableHeaderCell>
                <CTableHeaderCell>CÉDULA</CTableHeaderCell>
                <CTableHeaderCell>DATOS DE USUARIO</CTableHeaderCell>
                <CTableHeaderCell>DIRECCIÓN</CTableHeaderCell>
                <CTableHeaderCell>FECHA REGISTRO</CTableHeaderCell>
                <CTableHeaderCell>ROL</CTableHeaderCell>
                <CTableHeaderCell className="text-center">ESTADO</CTableHeaderCell>
                <CTableHeaderCell className="text-end pe-4">ACCIONES</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentItems.map((u) => {
                const isActive = u.status === true || u.status === 'active' || u.status === 1
                return (
                  <CTableRow key={u.id_user} className="text-nowrap">
                    <CTableDataCell className="ps-4 fw-bold" style={{ color: azulVA }}>
                      #{u.id_user}
                    </CTableDataCell>
                    <CTableDataCell className="fw-medium">{u.dni}</CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        <CAvatar
                          color={isActive ? 'primary' : 'secondary'}
                          size="sm"
                          className="me-2 text-white"
                        >
                          {u.first_name?.charAt(0)}
                        </CAvatar>
                        <div>
                          <div
                            className="fw-bold text-capitalize"
                            style={{ fontSize: '0.85rem', color: colors.text }}
                          >
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="small opacity-75" style={{ fontSize: '0.75rem' }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="small text-truncate" style={{ maxWidth: '140px' }}>
                        {u.address || '---'}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="small">
                      {u.register_creation
                        ? new Date(u.register_creation).toLocaleDateString()
                        : '---'}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="info" variant="outline" className="fw-normal">
                        {u.id_role === 1 ? 'Admin' : u.id_role === 2 ? 'Empleado' : 'Cliente'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CBadge
                        color={isActive ? 'success' : 'danger'}
                        shape="rounded-pill"
                        className="px-3 py-2"
                        onClick={() =>
                          setStatusModal({
                            visible: true,
                            userId: u.id_user,
                            currentStatus: isActive ? 'active' : 'inactive',
                          })
                        }
                        style={{ cursor: 'pointer' }}
                      >
                        {isActive ? 'ACTIVO' : 'INACTIVO'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-end pe-4">
                      <CButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(u.id_user)
                          setFormUser(u)
                          setModalVisible(true)
                        }}
                      >
                        <CIcon icon={cilPencil} style={{ color: azulVA }} />
                      </CButton>
                      <CButton
                        variant="ghost"
                        size="sm"
                        color="danger"
                        onClick={() => setDeleteModal({ visible: true, userId: u.id_user })}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>
        </div>

        {/* PAGINACIÓN CORREGIDA PARA TEMA OSCURO */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="small opacity-75">
            Mostrando {currentItems.length} de {filteredUsers.length} registros
          </div>
          <CPagination className="va-pagination mb-0 shadow-sm">
            <CPaginationItem
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{ cursor: 'pointer' }}
            >
              <CIcon icon={cilChevronLeft} />
            </CPaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <CPaginationItem
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
                style={{ cursor: 'pointer' }}
              >
                {i + 1}
              </CPaginationItem>
            ))}

            <CPaginationItem
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{ cursor: 'pointer' }}
            >
              <CIcon icon={cilChevronRight} />
            </CPaginationItem>
          </CPagination>
        </div>
      </div>

      {/* MODALES IGUALES... */}
      <CModal
        size="lg"
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        backdrop="static"
      >
        <CModalHeader style={{ backgroundColor: azulVA }} className="text-white border-0">
          <CModalTitle className="fw-bold">
            {editingId ? 'Editar Usuario' : 'Nuevo Registro'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4" style={{ backgroundColor: colors.cardBg }}>
          <CForm onSubmit={handleSave}>
            <CRow className="g-3">
              <CCol md={4}>
                <CFormInput
                  label="Cédula"
                  value={formUser.dni}
                  onChange={(e) => setFormUser({ ...formUser, dni: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="Nombres"
                  value={formUser.first_name}
                  onChange={(e) => setFormUser({ ...formUser, first_name: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="Apellidos"
                  value={formUser.last_name}
                  onChange={(e) => setFormUser({ ...formUser, last_name: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="Email"
                  type="email"
                  value={formUser.email}
                  onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="Dirección"
                  value={formUser.address}
                  onChange={(e) => setFormUser({ ...formUser, address: e.target.value })}
                />
              </CCol>
              <CCol md={4}>
                <CFormSelect
                  label="Rol"
                  value={formUser.id_role}
                  onChange={(e) => setFormUser({ ...formUser, id_role: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="1">Admin</option>
                  <option value="2">Empleado</option>
                  <option value="3">Cliente</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="Usuario"
                  value={formUser.user_name}
                  onChange={(e) => setFormUser({ ...formUser, user_name: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="Password"
                  type="password"
                  required={!editingId}
                  onChange={(e) => setFormUser({ ...formUser, password: e.target.value })}
                />
              </CCol>
            </CRow>
            <div className="text-end mt-4 pt-3 border-top">
              <CButton
                color="secondary"
                variant="ghost"
                className="me-2"
                onClick={() => setModalVisible(false)}
              >
                Cancelar
              </CButton>
              <CButton
                style={{ backgroundColor: verdeVA, borderColor: verdeVA }}
                className="text-dark fw-bold px-4"
                type="submit"
              >
                Guardar
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      <CModal
        visible={statusModal.visible}
        onClose={() => setStatusModal({ ...statusModal, visible: false })}
        alignment="center"
      >
        <CModalBody
          className="text-center py-4"
          style={{ backgroundColor: colors.cardBg, color: colors.text }}
        >
          <h5>¿Cambiar estado?</h5>
          <div className="mt-4">
            <CButton
              color="secondary"
              variant="ghost"
              className="me-2"
              onClick={() => setStatusModal({ ...statusModal, visible: false })}
            >
              No
            </CButton>
            <CButton color="primary" onClick={handleConfirmStatus}>
              Sí
            </CButton>
          </div>
        </CModalBody>
      </CModal>
      <CModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false, userId: null })}
        alignment="center"
      >
        <CModalBody
          className="text-center py-4"
          style={{ backgroundColor: colors.cardBg, color: colors.text }}
        >
          <h5 className="text-danger">¿Eliminar registro?</h5>
          <div className="mt-4">
            <CButton
              color="secondary"
              variant="ghost"
              className="me-2"
              onClick={() => setDeleteModal({ visible: false, userId: null })}
            >
              Cancelar
            </CButton>
            <CButton color="danger" onClick={confirmDelete}>
              Eliminar
            </CButton>
          </div>
        </CModalBody>
      </CModal>
    </CContainer>
  )
}

export default Users
