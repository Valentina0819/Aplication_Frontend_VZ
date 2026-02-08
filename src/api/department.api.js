import axios from 'axios'

// La URL base es correcta según tu index.js del backend
const departmentApi = axios.create({
  baseURL: 'http://localhost:5000/department',
})

export const getDepartmentsRequest = () => departmentApi.get('/')
export const createDepartmentRequest = (dept) => departmentApi.post('/', dept)
export const deleteDepartmentRequest = (id) => departmentApi.delete(`/${id}`)
