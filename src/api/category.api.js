import axios from 'axios'

const categoryApi = axios.create({
  baseURL: 'http://localhost:5000/category',
})

// 2. Exporta las funciones usando la instancia 'categoryApi'
export const getCategoriesRequest = () => categoryApi.get('/')

export const createCategoryRequest = (cat) => categoryApi.post('/', cat)

export const updateCategoryRequest = (id, newFields) => categoryApi.put(`/${id}`, newFields)

export const deleteCategoryRequest = (id) => categoryApi.delete(`/${id}`)
