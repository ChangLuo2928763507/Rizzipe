-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 03, 2025 at 05:13 PM
-- Server version: 8.0.39-0ubuntu0.22.04.1
-- PHP Version: 8.1.2-1ubuntu2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cse442_2025_spring_team_ae_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

CREATE TABLE `ingredients` (
  `ingredient` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `recipe_id` int DEFAULT NULL,
  `id` int NOT NULL,
  `qty` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ingredient_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'other'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ingredients`
--

INSERT INTO `ingredients` (`ingredient`, `recipe_id`, `id`, `qty`, `ingredient_name`) VALUES
('lemon juice', 2, 1, '2 tablespoons', 'lemon'),
('spaghetti', 2, 2, '8 ounces', 'spaghetti'),
('garlic cloves', 2, 3, '4 ', 'garlic'),
('crushed red pepper', 2, 4, '1/2 teaspoon', 'red pepper'),
('salt', 2, 5, '1/4 teaspoon', 'salt'),
('large shrimp', 2, 6, '1 pound', 'shrimp'),
('butter', 2, 7, '4 teaspoons', 'butter'),
('slivers garlic', 1, 8, '8-10 ', 'garlic'),
('extra virgin olive oil', 1, 9, '1 tablespoon', 'olive oil'),
(' boneless rump roast ', 1, 10, '3 to 3 1/2 pounds', 'other'),
('ground chuck', 9, 29, '2 pounds', 'other'),
('baked beans', 10, 30, '1 cup (136 grams)', 'beans'),
('flour', 13, 33, '2 tablespoons', 'flour'),
('butter', 13, 34, '2 tablespoons', 'butter'),
('garlic cloves', 14, 35, '2 small cloves of', 'garlic'),
('extra-virgin olive oil', 14, 36, '2 teaspoons', 'olive oil'),
('whole San Marzano tomatoes', 14, 37, '1 can', 'tomato'),
('Salt and pepper', 1, 44, NULL, 'salt and pepper'),
('cornstarch', 1, 46, '1 tablespoon', 'cornstarch'),
('parmesan cheese', 2, 47, '3 tablespoon', 'parmesan cheese'),
('chopped parsley\n', 2, 48, '2-3 tablspoons', 'parsley'),
('saltine crackers', 9, 49, '1/2 cup', 'saltine crackers'),
('large egg', 9, 50, '1', 'egg'),
('Worcestershire sauce', 9, 51, '2 tablespoons', 'worcestershire'),
('milk', 9, 52, '2 tablespoons', 'milk'),
('salt', 9, 53, '1 teaspoon', 'salt'),
('garlic powder', 9, 54, '1 teaspoon', 'garlic powder'),
('onion powder', 9, 55, '1 teaspoon', 'onion powder'),
('black pepper', 9, 56, '1/2 teaspoon', 'black pepper'),
('bacon', 10, 57, '4 slices', 'bacon'),
('pork sausages', 10, 58, '4', 'sausages'),
(' mushrooms', 10, 59, '6 ounces (170 grams)', 'mushroom'),
('ripe tomatoes', 10, 60, '2', 'tometo'),
('salt', 10, 61, 'small pinch', 'salt'),
('black pudding', 10, 62, '2 slices', 'pudding'),
('white bread', 10, 63, '2 slices', 'white bread'),
('large eggs', 10, 64, '4', 'egg'),
(' Lard or cooking oil', 10, 65, NULL, 'other'),
('milk', 13, 66, '1 cup', 'milk'),
('melty cheese', 13, 67, '8 ounces', 'cheese'),
('pickled jalapeno juice', 13, 68, '2-3 tablespoons', 'other'),
('salt', 13, 69, 'pinch', 'salt'),
('sea salt', 14, 70, '1/2 teaspoon', 'sea salt'),
('Cornmeal', 14, 71, NULL, 'cornmeal'),
('Pizza Dough', 14, 72, '1 pound', 'other'),
('mozzarella cheese', 14, 73, '8 ounces', 'mozzarella cheese'),
('Fresh basil leave', 14, 74, NULL, 'basil'),
('Red pepper flakes', 14, 75, NULL, 'red pepper flakes'),
('dried elbow pasta', 27, 103, '1 lb', 'other'),
('unsalted butter', 27, 104, '1/2 cup', 'other'),
('all purpose flour', 27, 105, '1/2 cup', 'other'),
('whole milk', 27, 106, '1 1/2', 'other'),
('half and half', 27, 107, '2 1/2', 'other'),
('shredded medium cheddar cheese', 27, 108, '4 cups', 'other'),
('shredded Gruyere cheese', 27, 109, '2 cups', 'other'),
('salt', 27, 110, '1/2 Tbsp', 'other'),
('black pepper', 27, 111, '1/2 tsp', 'other'),
('paprika', 27, 112, '1/4 tsp', 'other'),
('Spaghetti', 54, 276, '8 oz', 'other'),
('Olive Oil', 54, 277, '1/4 cup', 'other'),
('Garlic', 54, 278, '6 cloves (sliced)', 'other'),
('Red Pepper Flakes', 54, 279, '1 tsp', 'other'),
('Parsley', 54, 280, '2 tbsp (chopped)', 'other'),
('Parmesan Cheese', 54, 281, '1/4 cup (grated)', 'other'),
('Salt', 54, 282, 'To taste', 'other'),
('Black Pepper', 54, 283, 'To taste', 'other'),
('Chicken Breast', 55, 284, '2 breasts (about 1 lb)', 'other'),
('Romaine Lettuce', 55, 285, '4 cups (chopped)', 'other'),
('Caesar Dressing', 55, 286, '1/2 cup', 'other'),
('Croutons', 55, 287, '1 cup', 'other'),
('Parmesan Cheese', 55, 288, '1/4 cup (grated)', 'other'),
('Olive Oil', 55, 289, '2 tbsp', 'other'),
('Salt', 55, 290, 'To taste', 'other'),
('Black Pepper', 55, 291, 'To taste', 'other'),
('Chicken Thighs', 56, 292, '4 thighs (bone-in)', 'other'),
('Plain Yogurt', 56, 293, '1 cup', 'other'),
('Lemon Juice', 56, 294, '2 tbsp', 'other'),
('Garlic', 56, 295, '3 cloves (minced)', 'other'),
('Ginger', 56, 296, '1 tbsp (grated)', 'other'),
('Ground Cumin', 56, 297, '1 tsp', 'other'),
('Ground Coriander', 56, 298, '1 tsp', 'other'),
('Ground Turmeric', 56, 299, '1 tsp', 'other'),
('Ground Paprika', 56, 300, '1 tbsp', 'other'),
('Garam Masala', 56, 301, '1 tsp', 'other'),
('Red Chili Powder', 56, 302, '1/2 tsp', 'other'),
('Salt', 56, 303, '2 tbsp', 'other'),
('Olive Oil', 56, 304, '2 tbsp', 'other'),
('Udon Noodles', 57, 305, '8 oz', 'other'),
('Soy Sauce', 57, 306, '3 tbsp', 'other'),
('Sesame Oil', 57, 307, '2 tbsp', 'other'),
('Garlic', 57, 308, '3 cloves (minced)', 'other'),
('Ginger', 57, 309, '1 tbsp (grated)', 'other'),
('Carrot', 57, 310, '1 medium (julienned)', 'other'),
('Bell Pepper', 57, 311, '1 medium (sliced)', 'other'),
('Green Onion', 57, 312, '2 tbsp (chopped)', 'other'),
('Mushrooms', 57, 313, '1 cup (sliced)', 'other'),
('Bean Sprouts', 57, 314, '1 cup', 'other'),
('Olive Oil', 57, 315, '2 tbsp', 'other'),
('Sesame Seeds', 57, 316, '1 tbsp', 'other'),
('All-Purpose Flour', 58, 317, '1 cup', 'other'),
('Baking Powder', 58, 318, '1 tsp', 'other'),
('Eggs', 58, 319, '2 (beaten)', 'other'),
('Dashi Stock', 58, 320, '1 cup', 'other'),
('Soy Sauce', 58, 321, '2 tbsp', 'other'),
('Sugar', 58, 322, '1 tsp', 'other'),
('Salt', 58, 323, '1/2 tsp', 'other'),
('Tempura Scraps', 58, 324, '1/4 cup', 'other'),
('Pickled Ginger', 58, 325, '1/4 cup (chopped)', 'other'),
('Octopus (cooked and chopped)', 58, 326, '2 tbsp (chopped)', 'other'),
('Green Onion', 58, 327, '2 tbsp', 'other'),
('Takoyaki Sauce', 58, 328, '1/4 cup', 'other'),
('Bonito Flakes', 58, 329, '1/4 cup', 'other'),
('Seaweed Flakes', 58, 330, '1 tbsp', 'other'),
('Vanilla Ice Cream', 59, 331, '2 scoops', 'other'),
('Chocolate Syrup', 59, 332, '3 tbsp', 'other'),
('Caramel Sauce', 59, 333, '2 tbsp', 'other'),
('Whipped Cream', 59, 334, '1/4 cup', 'other'),
('Maraschino Cherries', 59, 335, '2', 'other'),
('Crushed Nuts (almonds or walnuts)', 59, 336, '2 tbsp', 'other'),
('Sprinkles', 59, 337, '1 tbsp', 'other'),
('Cookie Crumbles', 59, 338, '1/4 cup (optional)', 'other'),
('Fresh Fruit (strawberries or banana slices)', 59, 339, '1/4 cup (optional)', 'other'),
('Pizza Dough', 60, 340, '1 pizza dough (about 12 inches)', 'other'),
('Tomato Sauce', 60, 341, '1/2 cup', 'other'),
('Fresh Mozzarella', 60, 342, '8 oz', 'other'),
('Fresh Basil Leaves', 60, 343, '10 leaves', 'other'),
('Olive Oil', 60, 344, '2 tbsp', 'other'),
('Salt', 60, 345, 'To taste', 'other'),
('Black Pepper', 60, 346, 'To taste', 'other'),
('Parmesan Cheese', 60, 347, '2 tbsp', 'other'),
('Whole Wheat Bread', 61, 348, '2 slices', 'other'),
('Avocado', 61, 349, '1 ripe', 'other'),
('Eggs', 61, 350, '2 (large)', 'other'),
('Olive Oil', 61, 351, '1 tbsp', 'other'),
('Lemon Juice', 61, 352, '1 tsp', 'other'),
('Salt', 61, 353, 'To taste', 'other'),
('Black Pepper', 61, 354, 'To taste', 'other'),
('Red Pepper Flakes', 61, 355, '1/4 tsp', 'other'),
('Fresh Parsley', 61, 356, '1 tbsp (chopped)', 'other'),
('Chicken Thighs (bone-in and skin-on)', 62, 357, '6 thighs', 'other'),
('Scallions', 62, 358, '4 stalks (chopped)', 'other'),
('Garlic', 62, 359, '4 cloves (minced)', 'other'),
('Fresh Thyme', 62, 360, '2 tbsp (leaves)', 'other'),
('Scotch Bonnet Pepper (or Habanero)', 62, 361, '1 pepper (seeds removed)', 'other'),
('Ground Allspice', 62, 362, '1 tbsp', 'other'),
('Ground Cinnamon', 62, 363, '1/2 tsp', 'other'),
('Ground Nutmeg', 62, 364, '1/2 tsp', 'other'),
('Brown Sugar', 62, 365, '1 tbsp', 'other'),
('Soy Sauce', 62, 366, '1/4 cup', 'other'),
('Lime Juice', 62, 367, '2 tbsp', 'other'),
('Olive Oil', 62, 368, '2 tbsp', 'other'),
('Salt', 62, 369, 'To taste', 'other'),
('Black Pepper', 62, 370, 'To taste', 'other'),
('Fresh Cilantro (for garnish)', 62, 371, '2 tbsp (chopped)', 'other'),
('All-Purpose Flour', 63, 372, '1 cup', 'other'),
('Baking Powder', 63, 373, '1 tsp', 'other'),
('Milk', 63, 374, '3/4 cup', 'other'),
('Eggs', 63, 375, '1', 'other'),
('Ripe Banana', 63, 376, '1 ripe', 'other'),
('Butter', 63, 377, '2 tbsp', 'other'),
('Vanilla Extract', 63, 378, '1 tsp', 'other'),
('Sugar', 63, 379, '2 tbsp', 'other'),
('Salt', 63, 380, '1/4 tsp', 'other');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ingredients`
--
ALTER TABLE `ingredients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=399;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
