const mongoose = require('mongoose');
const { convertToGrams } = require('../Utils/convertToGram')

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default:""
  },
  ingredients: [
    {
      name: { type: String, required: true },
      weight: {
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },      
      },
    },
  ],
  image:{
    type: String,
    default: "https://img.freepik.com/free-vector/hand-drawn-food-elements_1411-48.jpg?t=st=1736510978~exp=1736514578~hmac=afea327c6511700a447c3b27bc8a3f15a7d0e62b3ea2974852b908327114b132&w=1380"
  },
  weight: {
    type: Number,
    default: 0,   
  },
  calories: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const calculateWeight = (ingredients) => {
  return ingredients.reduce(
    (total, ingredient) => total + convertToGrams(ingredient.weight.quantity, ingredient.weight.unit),
    0
  );
};

// Middleware: Összesített súly kiszámítása mentés előtt
recipeSchema.pre('save', function (next) {
  this.weight = calculateWeight(this.ingredients); 
  next();
});

// Middleware: Összesített súly kiszámítása frissítés előtt
recipeSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const ingredients = update.ingredients;

  if (ingredients) {
    update.weight = calculateWeight(ingredients);
  }

  next();
});

module.exports = mongoose.model('Recipe', recipeSchema);
