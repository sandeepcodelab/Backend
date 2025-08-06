import { Router } from "express";
import { createUser, getAllUsers, singleUser, updateUser } from "../controllers/userController.js";


const router = Router();

router.route("/create").post(createUser);
router.route("/allUsers").get(getAllUsers);
router.route("/:id").get(singleUser);
router.route("/update/:id").put(updateUser)


export default router