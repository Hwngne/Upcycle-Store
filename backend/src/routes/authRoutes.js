// import express from "express";
// import { login, changePassword, logout, me } from "../controllers/authController.js";
// import { authenticate } from "../middlewares/auth.js";

// const router = express.Router();

// router.post("/login", login);
// router.post("/logout", logout);
// router.post("/change-password", authenticate, changePassword);
// router.get("/me", authenticate, me);


// export default router;

import express from "express";
import {
    login,
    logout,
    me,
    changePassword,
    refreshToken
} from "../controllers/authController.js";

import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.post("/change-password", authenticate, changePassword);
router.post("/refresh-token", refreshToken);

export default router;
