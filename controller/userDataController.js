import userData from '../model/user.js'
import bcrypt from 'bcrypt'
import generateToken from '../utils/jwtutils.js'
import cloudinary from '../config/cloudinary.js'


const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'diva_user'},
            (error, result) => {
                if (error) return reject(error)
                resolve(result)
            })
        stream.end(buffer)
    })
}


export const addUSer = async(req,res) => {

    try{
        const password = await bcrypt.hash(req.body.password,10)
        let image = ""
        if(req.file) {
            const result = await uploadToCloudinary(req.file.buffer)
            image = result.secure_url
        }

        const saveuserData = {
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            address:req.body.address,
            image:image,
            password:password
        }
        const saveUSer = await userData.create(saveuserData)
         try {
            const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    sender: { name: "My App", email: "harsh.mongodb@gmail.com" },
                    to: [{ email: req.body.email }],
                    subject: "Test email",
                    htmlContent: "<p>Welcome To Our website!</p>",
                }),
            })
            if (!brevoRes.ok) {
                console.error('Brevo email failed:', brevoRes.status, await brevoRes.text())
            }
        } catch (emailError) {
            console.error('Brevo email error:', emailError.message)
        }


        res.status(200).json({"message":"data created successfully",data:saveUSer})

    }catch(error){

        res.status(500).json({"message":error.message})
    }

}

export const getUser = async (req,res) => {
    try {
        const getUserData = await userData.find()
        res.status(200).json({"message":"user data get successfully",data:getUserData})
    }catch(error) {
        res.status(500).json({"message":error.message})
    }
}

export const getSinglUser = async(req,res) => {
    try{
        const id = req.params.uid
        const uData = await userData.findById(id)
        res.status(200).json({"message":"user data get successfully",data:uData})

    } catch(error) {
        res.status(500).json({"message":error.message})
    }
}

export const deleteUser = async(req,res) => {
    try {
        const id = req.params.uid
        const deleteUserData = await userData.findByIdAndDelete(id)
        res.status(200).json({"message":"User Deleted Successfully",data:deleteUserData})

    }catch(error) {
        res.status(500).json({"message":error.message})
    }
}

export const updateUser = async(req,res) => {
    try {
         const id = req.params.uid
        const saveuserData = {
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            address:req.body.address
        }
       
        const updateUserData = await userData.findByIdAndUpdate(id,saveuserData,{
            new:true,
            runValidators:true
        })

        res.status(200).json({"message":"User Updated Successfully",data:updateUserData})


    }catch(error) {
        res.status(500).json({"message":error.message})
    }
}

export const login = async(req,res) => {
    try {
        const uData = await userData.findOne({email:req.body.email})
        if(!uData) {
            return res.status(200).json({message:"User Not Found",status:0})
        }

        const comparePassword  = await bcrypt.compare(req.body.password,uData.password)
        if(!comparePassword) {
                return res.status(200).json({message:"Password not match",status:0})
        }

         const token = await generateToken(uData)

         res.status(200).json({message:"Login Successfully",status:1,data:uData,token:token})
        
    }catch(error) {
        res.status(500).json({"message":error.message})
    }
}

