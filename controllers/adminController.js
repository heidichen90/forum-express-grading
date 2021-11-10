const db = require("../models");
const Restaurant = db.Restaurant;

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true, nest: true }).then((restaurants) => {
      return res.render("admin/restaurants", { restaurants: restaurants });
    });
  },

  createRestaurants: (req, res) => {
    return res.render("admin/create");
  },

  postRestaurants: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", "name didn't exist");
      return res.redirect("back");
    }
    const { name, tel, address, opening_hours, description } = req.body;
    return Restaurant.create({
      name,
      tel,
      address,
      opening_hours,
      description,
    }).then((restaurant) => {
      req.flash("success_messages", "restaurant was successfully created");
      return res.redirect("/admin/restaurants");
    });
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true }).then(
      (restaurant) => {
        return res.render("admin/restaurant", {
          restaurant: restaurant,
        });
      }
    );
  },
};

module.exports = adminController;
