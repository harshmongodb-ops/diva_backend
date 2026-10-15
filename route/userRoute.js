import express from 'express'
import { addUSer,getUser,getSinglUser,deleteUser,updateUser,login } from '../controller/userDataController.js'
import authanticateToken from '../utils/authMiddlware.js'
import upload from '../utils/uploadMiddleware.js'
const route = express.Router()

route.post('/api/add-user',upload.single("image"),addUSer)
route.get('/api/get-user',getUser)
route.get('/api/get-singleuser/:uid',authanticateToken,getSinglUser)
route.delete('/api/delete-user/:uid',authanticateToken,deleteUser)
route.put('/api/update-user/:uid',authanticateToken,updateUser)
route.post('/api/login',login)


export default route