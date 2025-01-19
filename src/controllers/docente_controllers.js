import {sendMailToRecoveryPassword,sendMailToUser} from "../config/nodemailer.js"
import Docentes from "../models/Docentes.js"
import generarJWT from "../helpers/CrearJWT.js"
import mongoose from "mongoose";

const login =async(req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const docenteBDD = await Docentes.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
    if(docenteBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
    if(!docenteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const verificarPassword = await docenteBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
        const token = generarJWT(docenteBDD._id,"docente")
        const {nombre,apellido,direccion,telefono,_id} =docenteBDD
    res.status(200).json({
        token,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email:docenteBDD.email
    })
}
const perfil =(req,res)=>{
    delete req.docenteBBD.token
    delete req.docenteBBD.confirmEmail
    delete req.docenteBBD.createdAt
    delete req.docenteBBD.updatedAt
    delete req.docenteBBD.__v
    res.status(200).json(req.docenteBBD)
}
const registro = async (req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Docentes.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    const nuevoDocente= new Docentes(req.body)
    nuevoDocente.password = await nuevoDocente.encrypPassword(password)

    const token = nuevoDocente.crearToken()
    await sendMailToUser(email,token)
    await nuevoDocente.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}
const confirmEmail =async(req,res)=>{
    if(!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        const docenteBDD = await Docentes.findOne({token:req.params.token})
        if(!docenteBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
        docenteBDD.token = null
        docenteBDD.confirmEmail=true
        await docenteBDD.save()
        res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"}) 
}
const listardocentes = (req,res)=>{
    res.status(200).json({res:'lista de docentes registrados'})
}
const detalledocente =async (req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    const docenteBDD = await Docentes.findById(id).select("-password")
    if(!docenteBDD) return res.status(404).json({msg:`Lo sentimos, no existe el Docente ${id}`})
    res.status(200).json({msg:docenteBDD})
}
const actualizarPerfil = (req,res)=>{
    res.status(200).json({res:'actualizar perfil de un docente registrado'})
}
const actualizarPassword = (req,res)=>{
    res.status(200).json({res:'actualizar password de un docente registrado'})
}
const recuperarPassword= async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const docenteBDD = await Docentes.findOne({email})
    if(!docenteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = docenteBDD.crearToken()
    docenteBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await docenteBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}
const comprobarTokenPasword = async (req,res)=>{
    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const docenteBDD = await Docentes.findOne({token:req.params.token})
    if(docenteBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await docenteBDD.save()
  
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}


const nuevoPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const docenteBDD = await Docentes.findOne({token:req.params.token})
    if(docenteBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    docenteBDD.token = null
    docenteBDD.password = await docenteBDD.encrypPassword(password)
    await docenteBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}

export {
    login,
    perfil,
    registro,
    confirmEmail,
    listardocentes,
    detalledocente,
    actualizarPerfil,
    actualizarPassword,
	recuperarPassword,
    comprobarTokenPasword,
	nuevoPassword
}