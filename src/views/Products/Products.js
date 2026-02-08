import React, { useEffect, useState } from 'react'
import { getDepartmentsRequest } from '../../api/department.api.js'
import { getCategoriesRequest } from '../../api/category.api.js'
import {
  CButton,
  CCard,
  CCardBody,
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
  CFormSelect,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster,
  CBadge,
  CInputGroup,
  CInputGroupText,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPencil,
  cilTrash,
  cilPlus,
  cilCheckCircle,
  cilWarning,
  cilSearch,
  cilFilter,
  cilReload,
  cilChevronLeft,
  cilChevronRight,
} from '@coreui/icons'

import {
  getProductsRequest,
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
} from '../../api/products.api.js'

const Products = () => {
  const [departments, setDepartments] = useState([])
  const [categories, setCategories] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const azulVA = '#002d72'
  const verdeVA = '#58cc7d'

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

  // ---------------------- ESTADOS ---------------------- //
  const [toasts, setToasts] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [step, setStep] = useState(1)

  // Datos y Filtrado
  const [allProducts, setAllProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [formData, setFormData] = useState({
    id_category: '',
    id_department: '',
    name_product: '',
    description: '',
    price: '',
  })
  const [selectedItem, setSelectedItem] = useState(null)

  const showToast = (type, message) =>
    setToasts((prev) => [...prev, { id: Date.now(), type, message }])

  // --- LÓGICA DE FILTRADO ---
  const applyFilters = (data, search, cat) => {
    let result = [...data]

    if (search) {
      const s = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name_product?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s) ||
          String(p.id_product).includes(s),
      )
    }

    if (cat !== 'all') {
      result = result.filter((p) => String(p.id_category) === String(cat))
    }

    setFilteredProducts(result)
    setCurrentPage(1)
  }

  useEffect(() => {
    applyFilters(allProducts, searchTerm, catFilter)
  }, [searchTerm, catFilter, allProducts])

  // --- LÓGICA DE PAGINACIÓN ---
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const loadData = async () => {
    try {
      const [resDept, resCat] = await Promise.all([getDepartmentsRequest(), getCategoriesRequest()])
      setDepartments(resDept.data)
      setCategories(resCat.data)
    } catch (err) {
      showToast('danger', 'Error al sincronizar catálogos')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getNameDept = (id) => {
    const item = departments.find((d) => String(d.id_department) === String(id))
    return item ? item.name_department : 'No asignado'
  }

  const getNameCat = (id) => {
    const item = categories.find((c) => String(c.id_category) === String(id))
    return item ? item.name_category : 'No asignado'
  }

  const loadProducts = async () => {
    try {
      const res = await getProductsRequest()
      setAllProducts(res.data)
    } catch (err) {
      showToast('danger', 'Error de conexión')
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const resetFilters = () => {
    setSearchTerm('')
    setCatFilter('all')
  }

  // --- OPERACIONES CRUD ---
  const openModal = (type, item = null) => {
    setModalType(type)
    setSelectedItem(item)
    setStep(1)
    setFormData(
      item || { id_category: '', id_department: '', name_product: '', description: '', price: '' },
    )
    setModalVisible(true)
  }

  const saveItem = async () => {
    try {
      await createProductRequest(formData)
      showToast('success', 'Producto registrado')
      setModalVisible(false)
      loadProducts()
    } catch (err) {
      showToast('danger', 'Error al crear')
    }
  }

  const updateItem = async () => {
    try {
      await updateProductRequest(selectedItem.id_product, formData)
      showToast('success', 'Actualizado correctamente')
      setModalVisible(false)
      loadProducts()
    } catch (err) {
      showToast('danger', 'Error al actualizar')
    }
  }

  const deleteItem = async () => {
    try {
      await deleteProductRequest(selectedItem.id_product)
      showToast('success', 'Eliminado')
      setModalVisible(false)
      loadProducts()
    } catch (err) {
      showToast('danger', 'Error al eliminar')
    }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  return (
    <CContainer fluid className="px-4 pb-4">
      <style>
        {`
          .main-card-va { background: ${colors.cardBg} !important; border-radius: 20px; border: 1px solid ${colors.border}; color: ${colors.text}; }
          .va-pagination .page-link { background-color: ${colors.pagBtn} !important; border-color: ${colors.border} !important; color: ${colors.pagText} !important; box-shadow: none !important; }
          .va-pagination .page-item.active .page-link { background-color: ${verdeVA} !important; border-color: ${verdeVA} !important; color: #1d222b !important; font-weight: bold; }
          .va-input-group-text { background-color: ${azulVA} !important; border: none !important; color: white !important; }
        `}
      </style>

      <CToaster placement="top-end">
        {toasts.map((t) => (
          <CToast key={t.id} autohide delay={2600} color={t.type} className="text-white">
            <CToastHeader closeButton>
              <strong>Notificación</strong>
            </CToastHeader>
            <CToastBody>{t.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>

      <div className="mb-4 d-flex justify-content-between align-items-end">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: isDarkMode ? '#fff' : azulVA }}>
            Gestión de <span style={{ color: verdeVA }}>Productos</span>
          </h2>
          <p className="text-muted mb-0">Control de inventario y precios V&A.</p>
        </div>
        <CButton
          style={{ backgroundColor: azulVA, borderColor: azulVA }}
          className="text-white px-4 py-2 rounded-pill shadow-sm"
          onClick={() => openModal('create')}
        >
          <CIcon icon={cilPlus} className="me-2" /> Nuevo Producto
        </CButton>
      </div>

      <div className="main-card-va p-4 shadow-sm">
        <CRow
          className="g-3 mb-4 p-3 rounded-3"
          style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,45,114,0.03)' }}
        >
          <CCol md={6}>
            <CInputGroup>
              <CInputGroupText className="va-input-group-text">
                <CIcon icon={cilSearch} />
              </CInputGroupText>
              <CFormInput
                placeholder="Buscar por nombre, descripción o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CInputGroup>
          </CCol>
          <CCol md={4}>
            <CInputGroup>
              <CInputGroupText className="va-input-group-text">
                <CIcon icon={cilFilter} />
              </CInputGroupText>
              <CFormSelect value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                <option value="all">Todas las Categorías</option>
                <option value="1">Categoría 1</option>
                <option value="2">Categoría 2</option>
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
          <CTable hover align="middle" borderless className="mb-0">
            <CTableHead style={{ backgroundColor: colors.tableHead }}>
              <CTableRow>
                <CTableHeaderCell className="ps-4">PRODUCTO</CTableHeaderCell>
                <CTableHeaderCell>DESCRIPCIÓN</CTableHeaderCell>
                <CTableHeaderCell>DEP / CAT</CTableHeaderCell>
                <CTableHeaderCell>PRECIO</CTableHeaderCell>
                <CTableHeaderCell className="text-end pe-4">ACCIONES</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentItems.map((item) => (
                <CTableRow
                  key={item.id_product}
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  <CTableDataCell className="ps-4">
                    <div className="fw-bold" style={{ color: colors.text }}>
                      {item.name_product}
                    </div>
                    <div className="small opacity-75">ID: #{item.id_product}</div>
                  </CTableDataCell>
                  <CTableDataCell className="small">
                    {item.description || 'Sin descripción'}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge
                      color="secondary"
                      variant="outline"
                      className="me-1"
                      title={`Departamento: ${getNameDept(item.id_department)}`}
                      style={{ cursor: 'help' }}
                    >
                      D: {item.id_department}
                    </CBadge>
                    <CBadge
                      color="info"
                      variant="outline"
                      title={`Categoría: ${getNameCat(item.id_category)}`}
                      style={{ cursor: 'help' }}
                    >
                      C: {item.id_category}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="fw-bold" style={{ color: verdeVA }}>
                    ${item.price}
                  </CTableDataCell>
                  <CTableDataCell className="text-end pe-4">
                    <CButton
                      color="info"
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal('edit', item)}
                    >
                      <CIcon
                        icon={cilPencil}
                        size="lg"
                        style={{ color: isDarkMode ? '#00d4ff' : azulVA }}
                      />
                    </CButton>
                    <CButton
                      color="danger"
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal('delete', item)}
                    >
                      <CIcon icon={cilTrash} size="lg" />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="small opacity-75">
            Mostrando {currentItems.length} de {filteredProducts.length} productos
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

      <CModal
        size="lg"
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        backdrop="static"
        alignment="center"
      >
        <CModalHeader
          style={{ backgroundColor: modalType === 'delete' ? '#e55353' : azulVA }}
          className="text-white border-0"
        >
          <CModalTitle className="fw-bold">
            {modalType === 'create' && 'Registrar Nuevo Producto'}
            {modalType === 'edit' && 'Actualizar Producto'}
            {modalType === 'delete' && 'Confirmar Eliminación'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4" style={{ backgroundColor: colors.cardBg, color: colors.text }}>
          {modalType === 'delete' ? (
            <div className="text-center py-3">
              <CIcon
                icon={cilWarning}
                size="3xl"
                className="text-danger mb-3"
                style={{ height: '60px' }}
              />
              <h4 className="fw-bold">¿Deseas eliminar este registro?</h4>
              <p className="opacity-75">
                Borrarás: <strong>{selectedItem?.name_product}</strong>
              </p>
              <div className="d-flex justify-content-center gap-2 mt-4">
                <CButton color="secondary" variant="ghost" onClick={() => setModalVisible(false)}>
                  Cancelar
                </CButton>
                <CButton color="danger" className="px-4 text-white" onClick={deleteItem}>
                  Sí, Eliminar
                </CButton>
              </div>
            </div>
          ) : (
            <>
              <CNav
                variant="pills"
                className="flex-column flex-sm-row mb-4 bg-light p-1 rounded-pill"
              >
                {[1, 2, 3].map((s) => (
                  <CNavItem key={s} className="flex-sm-fill text-center">
                    <CNavLink
                      active={step === s}
                      onClick={() => setStep(s)}
                      style={{ cursor: 'pointer', borderRadius: '20px' }}
                    >
                      {s}. {s === 1 ? 'Información' : s === 2 ? 'Categorización' : 'Confirmar'}
                    </CNavLink>
                  </CNavItem>
                ))}
              </CNav>
              <CTabContent>
                <CTabPane visible={step === 1}>
                  <CRow className="g-3">
                    <CCol md={12}>
                      <CFormInput
                        label="Nombre del producto"
                        name="name_product"
                        value={formData.name_product}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={12}>
                      <CFormInput
                        label="Descripción"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                </CTabPane>
                <CTabPane visible={step === 2}>
                  <CRow className="g-3">
                    <CCol md={6}>
                      <CFormInput
                        type="number"
                        label="ID Categoría"
                        name="id_category"
                        value={formData.id_category}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormInput
                        type="number"
                        label="ID Departamento"
                        name="id_department"
                        value={formData.id_department}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={12}>
                      <CFormInput
                        label="Precio"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                </CTabPane>
                <CTabPane visible={step === 3} className="text-center py-2">
                  <CIcon
                    icon={cilCheckCircle}
                    size="3xl"
                    style={{ color: verdeVA, height: '60px' }}
                    className="mb-3"
                  />
                  <h5>Todo listo para guardar</h5>
                  <p className="small opacity-75">
                    Verifica: <strong>{formData.name_product}</strong>
                  </p>
                </CTabPane>
              </CTabContent>
              <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                <CButton
                  color="secondary"
                  variant="ghost"
                  disabled={step === 1}
                  onClick={() => setStep(step - 1)}
                >
                  Atrás
                </CButton>
                {step < 3 ? (
                  <CButton
                    style={{ backgroundColor: azulVA }}
                    className="text-white px-4"
                    onClick={() => setStep(step + 1)}
                  >
                    Siguiente
                  </CButton>
                ) : (
                  <CButton
                    style={{ backgroundColor: verdeVA, borderColor: verdeVA }}
                    className="text-dark fw-bold px-4"
                    onClick={modalType === 'create' ? saveItem : updateItem}
                  >
                    {modalType === 'create' ? 'Guardar Producto' : 'Actualizar Cambios'}
                  </CButton>
                )}
              </div>
            </>
          )}
        </CModalBody>
      </CModal>
    </CContainer>
  )
}

export default Products
