import {Router} from 'express'
import verificarAutenticacion from '../middlewares/autenticacion.js';
const router = Router()
import {
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
} from "../controllers/docente_controllers.js"
router.post("/login", login);
router.post("/registro", registro);
router.get("/confirmar/:token", confirmEmail);
router.get("/docentes", listardocentes);
router.get("/recuperar-password", recuperarPassword);
router.get("/recuperar-password/:token", comprobarTokenPasword);
router.post("/nuevo-password/:token", nuevoPassword);

router.get("/perfil",verificarAutenticacion,perfil);
router.put('/docente/actualizarpassword',verificarAutenticacion,actualizarPassword)
router.get("/docente/:id", verificarAutenticacion,detalledocente);
router.put("/docente/:id",verificarAutenticacion ,actualizarPerfil);

export default router