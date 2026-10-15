import jwt from 'jsonwebtoken'
import secretKey from '../jwtconfig.js'

function authanticateToken(req,res,next) {
    const authHeader = req.header('Authorization')
    if(!authHeader) {
        res.status(401).json({'message':"Authorization is Missing"})
    }

    const [bearer ,token] = authHeader.split(" ")

    if(bearer != "Bearer" || !token) {
        res.status(401).json({'message':"Invalid Token Formate"})
    }

    jwt.verify(token,secretKey,(error,user)=>{
        if(error) {
            res.status(403).json({'message':"Invalid Token"})
        }
        req.user = user;
        next()
    })


} 

export default authanticateToken