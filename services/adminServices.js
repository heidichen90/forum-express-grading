const db = require("../models");
const Category = db.Category;
const Restaurant = db.Restaurant;

const adminServices = {
  getRestaurants: async (req, res, callback) => {
    try {
      const restaurants = await Restaurant.findAll({
        raw: true,
        nest: true,
        include: [Category],
      });
      return callback({ restaurants });
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = adminServices;
