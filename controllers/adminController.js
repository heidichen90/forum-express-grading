const db = require("../models");
const Restaurant = db.Restaurant;
const fs = require("fs");

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
    const { file } = req;
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log("Error: ", err);
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Restaurant.create({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: file ? `/upload/${file.originalname}` : null,
          }).then((restaurant) => {
            req.flash(
              "success_messages",
              "restaurant was successfully created"
            );
            return res.redirect("/admin/restaurants");
          });
        });
      });
    } else {
      return Restaurant.create({
        name,
        tel,
        address,
        opening_hours,
        description,
        image: null,
      }).then((restaurant) => {
        req.flash("success_messages", "restaurant was successfully created");
        return res.redirect("/admin/restaurants");
      });
    }
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true }).then(
      (restaurant) => {
        return res.render("admin/restaurant", {
          restaurant,
        });
      }
    );
  },

  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true }).then(
      (restaurant) => {
        return res.render("admin/create", { restaurant });
      }
    );
  },

  putRestaurant: (req, res) => {
    console.warn("put restaurant", req.file);
    if (!req.body.name) {
      req.flash("error_message", "name didnt exit");
      return res.redirect("back");
    }

    const { file } = req;
    const { name, tel, address, opening_hours, description } = req.body;
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log("Error: ", err);
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Restaurant.findByPk(req.params.id).then((restaurant) => {
            restaurant
              .update({
                name,
                tel,
                address,
                opening_hours,
                description,
                image: file ? `/upload/${file.originalname}` : restaurant.image,
              })
              .then((restaurant) => {
                req.flash(
                  "success_messages",
                  "restaurant was successfully to update"
                );
                res.redirect("/admin/restaurants");
              });
          });
        });
      });
    } else {
      return Restaurant.findByPk(req.params.id).then((restaurant) => {
        restaurant
          .update({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: restaurant.image,
          })
          .then((restaurant) => {
            req.flash(
              "success_messages",
              "restaurant was successfully to update"
            );
            res.redirect("/admin/restaurants");
          });
      });
    }
  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then((restaurant) => {
      restaurant.destroy().then((restaurant) => {
        res.redirect("/admin/restaurants");
      });
    });
  },
};

module.exports = adminController;
