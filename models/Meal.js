const mongoose = require("mongoose");
const { convertToGrams } = require("../Utils/convertToGram");

const mealSchema = new mongoose.Schema({
  weight: {
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  calories: {
    type: Number,
    default: 0,
  },
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Flag a frissítés elkerülésére
mealSchema.statics.upsertMeal = async function (mealData) {
  const { createdBy, recipe_id, weight } = mealData;

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

  const existingMeal = await this.findOne({
    createdBy,
    recipe_id,
    createdAt: { $gte: todayStart, $lt: todayEnd },
  });

  if (existingMeal) {
    existingMeal.weight.quantity += weight.quantity;

    const recipe = await mongoose.model("Recipe").findById(recipe_id);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const caloriesPerGram = recipe.calories / recipe.weight;
    existingMeal.calories = (
      caloriesPerGram *
      convertToGrams(existingMeal.weight.quantity, existingMeal.weight.unit)
    ).toFixed(0);

    await existingMeal.save();
    return existingMeal;
  }

  const recipe = await mongoose.model("Recipe").findById(recipe_id);
  if (!recipe) {
    throw new Error("Recipe not found");
  }

  const caloriesPerGram = recipe.calories / recipe.weight;
  mealData.calories = (
    caloriesPerGram * convertToGrams(weight.quantity, weight.unit)
  ).toFixed(0);

  const newMeal = new this(mealData);
  await newMeal.save();
  return newMeal;
};

module.exports = mongoose.model("Meal", mealSchema);
