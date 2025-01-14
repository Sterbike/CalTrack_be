const Meal = require("../models/Meal");

exports.getMeals = async (req, res) => {
  const user_id = req.user.id;
  console.log(user_id);
  

  try {
    const meals = await Meal.find({ createdBy: user_id });

    if (!meals || meals.length === 0) {
      return res.status(404).json({ error: "No meals found" });
    }

    res.json({ meals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getMealsByDate = async (req, res) => {
  const user_id = req.user.id;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  try {
    const meals = await Meal.find({
      createdBy: user_id,
      createdAt: {
        $gte: new Date(date), // Greater than or equal to the given date
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)), // Less than the next day
      },
    })
      .populate({
        path: "recipe_id",
        select: "title", // Only fetch the title and image fields
      });

    if (!meals || meals.length === 0) {
      return res.status(404).json({ error: "No meals found for this date" });
    }

    res.json({ meals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMeal = async (req, res) => {
  const user_id = req.user.id;
  const { weight, recipe_id } = req.body;

  if (!weight || !recipe_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const mealData = {
      createdBy: user_id,
      weight,
      recipe_id,
    };

    const meal = await Meal.upsertMeal(mealData);

    res.status(200).json({ message: "Meal processed successfully", meal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMeal = async (req, res) => {
  const { meal_id } = req.params;
  const user_id = req.user.id;

  try {
    const meal = await Meal.findById(meal_id);

    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    // Ellenőrizzük, hogy az étkezés a felhasználóhoz tartozik
    if (meal.createdBy.toString() !== user_id.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this meal" });
    }

    await meal.deleteOne();

    res.json({ message: "Meal deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
