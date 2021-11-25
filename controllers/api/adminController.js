const db = require("../../models");
const Restaurant = db.Restaurant;
const Category = db.Category;

//services
const adminServices = require("../../services/adminServices");

const adminController = {
  getRestaurants: (req, res) => {
    return adminServices.getRestaurants(req, res, (data) => {
      return res.json(data);
    });
  },
  getRestaurant: (req, res) => {
    return adminServices.getRestaurant(req, res, (data) => {
      return res.json(data);
    });
  },
};

module.exports = adminController;
