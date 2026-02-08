import axios from 'axios'

// Instancia configurada para el módulo de productos
const productApi = axios.create({
  baseURL: 'http://localhost:5000/products', // Ajusta el puerto según tu configuración (3000 o 5000)
})

// GET: Obtener todos los productos
export const getProductsRequest = () => productApi.get('/')

// GET: Obtener un producto por su ID
export const getProductRequest = (id_product) => productApi.get(`/${id_product}`)

// POST: Crear un nuevo producto
// El objeto 'product' debe contener: id_category, id_department, name_product, description, price
export const createProductRequest = (product) => productApi.post('/', product)

// PUT: Actualización total de un producto
export const updateProductRequest = (id_product, newFields) =>
  productApi.put(`/${id_product}`, newFields)

// DELETE: Eliminación permanente (Hard delete)
export const deleteProductRequest = (id_product) => productApi.delete(`/${id_product}`)

// PATCH: Actualización parcial de un producto
export const patchProductRequest = (id, fields) => productApi.patch(`/${id}`, fields)
