const express = require("express");
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {getMeals, getMealsByDate, addMeal, deleteMeal} = require('../Controllers/mealController')


// Meals lekérdezése
router.get("/getMeals", protect, getMeals);

// Meals lekérdezése adott dátumra
router.get("/getMealsByDate", protect, getMealsByDate);

// Új napi Meal hozzáadása
router.post("/addMeal", protect, addMeal);

// Napi Meal törlése
router.delete("/deleteMeal/:meal_id", protect, deleteMeal);

module.exports = router;