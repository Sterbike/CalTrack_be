const express = require('express');
const cors = require('cors');
const connectDB = require('./mongo');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
//import routes
const authRoutes = require('./Routes/auth');
const recipeRoutes = require('./Routes/recipes')
const mealRoutes = require('./Routes/meals'); 

app.use(bodyParser.json());

connectDB();

//routes
app.use('/auth', authRoutes);
app.use('/recipes', recipeRoutes);
app.use('/meals', mealRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

module.exports = app;
