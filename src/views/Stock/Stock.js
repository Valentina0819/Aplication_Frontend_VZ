import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CBadge,
  CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilTrash,
  cilPencil,
  cilPlus,
  cilSave,
  cilCalendar,
  cilTag,
  cilSearch,
  cilHistory,
} from '@coreui/icons'

const API_BASE = 'http://localhost:5000'
const API_STOCK = `${API_BASE}/stock`
const API_PRODUCT = `${API_BASE}/product`

export const Stock = () => {
  // --- CONFIGURACIÓN DE TEMA V&A ---
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
  }

  // --- LÓGICA ORIGINAL ---
  const [items, setItems] = useState([])
  const [productsList, setProductsList] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [itemEdit, setItemEdit] = useState(null)
  const [searchTerm, setSearchTerm] = useState('') // Filtro único

  const [formData, setFormData] = useState({
    id_product: '',
    movement_type: 'entrada',
    quantity: '',
    movement_date: new Date().toISOString().split('T')[0],
    note_stock: '',
  })

  const cargarStock = async () => {
    try {
      const resp = await fetch(API_STOCK)
      const data = await resp.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error al cargar stock:', err)
    }
  }

  const cargarProductos = async () => {
    try {
      const resp = await fetch(API_PRODUCT)
      const data = await resp.json()
      setProductsList(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error al cargar productos:', err)
    }
  }

  useEffect(() => {
    cargarStock()
    cargarProductos()
  }, [])

  const openModal = (type, item = null) => {
    setModalType(type)
    if (type === 'edit' && item) {
      setItemEdit(item)
      setFormData({
        id_product: item.id_product || '',
        movement_type: item.movement_type || 'entrada',
        quantity: item.quantity || '',
        movement_date: item.movement_date ? item.movement_date.split('T')[0] : '',
        note_stock: item.note_stock || '',
      })
    } else {
      setItemEdit(null)
      setFormData({
        id_product: '',
        movement_type: 'entrada',
        quantity: '',
        movement_date: new Date().toISOString().split('T')[0],
        note_stock: '',
      })
    }
    setModalVisible(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const guardarCambios = async () => {
    const metodo = modalType === 'edit' ? 'PUT' : 'POST'
    const url = modalType === 'edit' ? `${API_STOCK}/${itemEdit.id_stock}` : API_STOCK
    const dataAEnviar = {
      ...formData,
      id_product: parseInt(formData.id_product),
      quantity: parseInt(formData.quantity),
    }

    try {
      const resp = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataAEnviar),
      })
      if (resp.ok) {
        setModalVisible(false)
        cargarStock()
      }
    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }

  const eliminarRegistro = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return
    try {
      await fetch(`${API_STOCK}/${id}`, { method: 'DELETE' })
      cargarStock()
    } catch (err) {
      console.error('Error al eliminar:', err)
    }
  }

  // Lógica del filtro de búsqueda
  const filteredItems = items.filter(
    (item) =>
      (item.name_product || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id_stock?.toString() || '').includes(searchTerm),
  )

  return (
    <CContainer fluid className="px-4 pb-4">
      <style>
        {`
          .main-card-va { background: ${colors.cardBg} !important; border-radius: 20px; border: 1px solid ${colors.border}; color: ${colors.text}; }
          .custom-table thead th { background-color: ${colors.tableHead} !important; color: ${colors.text}; font-size: 11px; text-transform: uppercase; border: none; }
          .custom-table td { border-bottom: 1px solid ${colors.border} !important; color: ${isDarkMode ? '#d0d0d0' : '#4f5d73'} !important; }
        `}
      </style>

      {/* CABECERA */}
      <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
        <div>
          <h3 className="fw-bold mb-0">
            Gestión de <span style={{ color: verdeVA }}>Movimientos</span>
          </h3>
          <p className="small mb-0" style={{ color: colors.subText }}>
            V&A System - Historial de Entradas y Salidas
          </p>
        </div>
        <CButton
          style={{ backgroundColor: azulVA, borderColor: azulVA }}
          className="text-white px-4 py-2 rounded-pill shadow-sm"
          onClick={() => openModal('add')}
        >
          <CIcon icon={cilPlus} className="me-2" /> Nuevo Registro
        </CButton>
      </div>

      <div className="main-card-va p-4 shadow-sm">
        {/* SECCIÓN DE FILTRO ÚNICO */}
        <CRow className="mb-4">
          <CCol md={6} lg={4}>
            <CInputGroup>
              <CInputGroupText style={{ backgroundColor: azulVA }} className="border-0 text-white">
                <CIcon icon={cilSearch} />
              </CInputGroupText>
              <CFormInput
                placeholder="Buscar por producto o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CInputGroup>
          </CCol>
        </CRow>

        {/* TABLA ESTILO USUARIOS */}
        <div className="table-responsive">
          <CTable align="middle" className="custom-table mb-0" hover responsive>
            <CTableHead>
              <CTableRow className="text-nowrap">
                <CTableHeaderCell className="ps-4">ID</CTableHeaderCell>
                <CTableHeaderCell>PRODUCTO</CTableHeaderCell>
                <CTableHeaderCell className="text-center">TIPO</CTableHeaderCell>
                <CTableHeaderCell className="text-center">CANTIDAD</CTableHeaderCell>
                <CTableHeaderCell>FECHA</CTableHeaderCell>
                <CTableHeaderCell className="text-end pe-4">ACCIONES</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredItems.map((item) => (
                <CTableRow key={item.id_stock} className="text-nowrap">
                  <CTableDataCell className="ps-4 fw-bold" style={{ color: azulVA }}>
                    #{item.id_stock}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div
                      className="fw-bold text-capitalize"
                      style={{ fontSize: '0.85rem', color: colors.text }}
                    >
                      {item.name_product || `ID: ${item.id_product}`}
                    </div>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CBadge
                      color={item.movement_type === 'salida' ? 'danger' : 'success'}
                      shape="rounded-pill"
                      className="px-3 py-2"
                    >
                      {item.movement_type?.toUpperCase()}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center fw-bold text-primary">
                    {item.quantity}
                  </CTableDataCell>
                  <CTableDataCell className="small">
                    {item.movement_date ? new Date(item.movement_date).toLocaleDateString() : '---'}
                  </CTableDataCell>
                  <CTableDataCell className="text-end pe-4">
                    <CButton variant="ghost" size="sm" onClick={() => openModal('edit', item)}>
                      <CIcon icon={cilPencil} style={{ color: azulVA }} />
                    </CButton>
                    <CButton
                      variant="ghost"
                      size="sm"
                      color="danger"
                      onClick={() => eliminarRegistro(item.id_stock)}
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

      {/* MODAL REDISEÑADO */}
      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader style={{ backgroundColor: azulVA }} className="text-white border-0">
          <CModalTitle className="fw-bold">
            <CIcon icon={modalType === 'edit' ? cilPencil : cilHistory} className="me-2" />
            {modalType === 'edit' ? 'Editar Registro' : 'Nuevo Movimiento'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4" style={{ backgroundColor: colors.cardBg }}>
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormLabel className="fw-bold small">Producto</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilTag} />
                </CInputGroupText>
                <CFormSelect
                  name="id_product"
                  value={formData.id_product}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccione un producto...</option>
                  {productsList.map((p) => (
                    <option key={p.id_product} value={p.id_product}>
                      {p.name_product}
                    </option>
                  ))}
                </CFormSelect>
              </CInputGroup>
            </CCol>
            <CCol md={6}>
              <CFormLabel className="fw-bold small">Tipo de Movimiento</CFormLabel>
              <CFormSelect
                name="movement_type"
                value={formData.movement_type}
                onChange={handleInputChange}
              >
                <option value="entrada">Entrada (+)</option>
                <option value="salida">Salida (-)</option>
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel className="fw-bold small">Cantidad</CFormLabel>
              <CFormInput
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel className="fw-bold small">Fecha</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
                <CFormInput
                  type="date"
                  name="movement_date"
                  value={formData.movement_date}
                  onChange={handleInputChange}
                />
              </CInputGroup>
            </CCol>
            <CCol md={12}>
              <CFormLabel className="fw-bold small">Notas Adicionales</CFormLabel>
              <CFormTextarea
                name="note_stock"
                rows={3}
                value={formData.note_stock}
                onChange={handleInputChange}
              />
            </CCol>

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
                onClick={guardarCambios}
              >
                <CIcon icon={cilSave} className="me-2" /> Guardar
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>
    </CContainer>
  )
}

export default Stock
