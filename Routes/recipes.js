const express = require("express");
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {getRecipes, addRecipe, updateRecipe, deleteRecipe} = require('../Controllers/recipeController')


// Receptek lekérdezése
router.get('/getRecipes', protect, getRecipes);

// Új recept hozzáadása
router.post("/addRecipe", protect, addRecipe);

//Recept frissítése
router.put("/updateRecipe/:recipe_id", protect, updateRecipe);

//Recept törlése
router.delete("/deleteRecipe/:recipe_id", protect, deleteRecipe);

module.exports = router;
