const Recipe = require("../models/Recipe");
const Meal = require("../models/Meal");
const { convertToGrams } = require("../Utils/convertToGram");

// A receptek lekérése egy adott user_id alapján
exports.getRecipes = async (req, res) => {
  const user_id = req.user.id;
  try {
    const recipes = await Recipe.find({ createdBy: user_id });
    console.log(recipes);

    if (!recipes.length) {
      return res.status(404).json({ error: "No recipes found for this user" });
    }

    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Új recept hozzáadása
exports.addRecipe = async (req, res) => {
  const user_id = req.user.id;
  const { title, calories, image, instructions, ingredients } = req.body;

  if (!user_id || !title || !ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newRecipe = new Recipe({
      createdBy: user_id,
      title: title,
      ingredients: ingredients,
      calories: calories || null,
      instructions: instructions || null,
      image: image || null,
    });

    await newRecipe.save();

    res
      .status(201)
      .json({ message: "Recipe added successfully", recipe: newRecipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Recept frissítése
exports.updateRecipe = async (req, res) => {
  const user_id = req.user.id;
  const { recipe_id } = req.params;
  console.log(recipe_id);

  const { title, calories, image, instructions, ingredients } = req.body;

  if (!title || !ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const recipe = await Recipe.findById(recipe_id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    if (recipe.createdBy.toString() !== user_id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only update your own recipes" });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipe_id,
      {
        title: title,
        ingredients: ingredients,
        calories: calories || null,
        instructions: instructions || null,
        image: image || null,
      },
      { new: true }
    );

    if (calories || ingredients) {
      const meals = await Meal.find({ recipe_id: recipe_id });

      for (const meal of meals) {
        const caloriesPerGram = updatedRecipe.calories / updatedRecipe.weight;
        meal.calories = (
          caloriesPerGram *
          convertToGrams(meal.weight.quantity, meal.weight.unit)
        ).toFixed(0);

        await meal.save();
      }
    }

    res.json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Recept törlése
exports.deleteRecipe = async (req, res) => {
  const { recipe_id } = req.params;
  const user_id = req.user.id;

  try {
    const recipe = await Recipe.findById(recipe_id);

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    if (recipe.createdBy.toString() !== user_id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own recipes" });
    }

    await Recipe.findByIdAndDelete(recipe_id);
    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
