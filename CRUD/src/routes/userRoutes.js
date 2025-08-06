import { Router } from "express";
import { createUser, getAllUsers, singleUser } from "../controllers/userController.js";


const router = Router();

router.route("/create").post(createUser);
router.route("/allUsers").get(getAllUsers);
router.route("/:id").get(singleUser);


export default router