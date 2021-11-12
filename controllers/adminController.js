const db = require("../models");
const Restaurant = db.Restaurant;
const User = db.User;
// imgur setup
const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

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
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        if (err) console.log("Error: ", err);
        return Restaurant.create({
          name,
          tel,
          address,
          opening_hours,
          description,
          image: file ? img.data.link : null,
        }).then((restaurant) => {
          req.flash("success_messages", "restaurant was successfully created");
          return res.redirect("/admin/restaurants");
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
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        if (err) console.log("Error: ", err);
        return Restaurant.findByPk(req.params.id).then((restaurant) => {
          restaurant
            .update({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: file ? img.data.link : restaurant.image,
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

  getUsers: (req, res) => {
    return User.findAll({ raw: true, nest: true }).then((users) => {
      return res.render("admin/users", { users });
    });
  },

  toggleAdmin: (req, res) => {
    return User.findByPk(req.params.id).then((user) => {
      const { isAdmin } = user.toJSON();
      if (isAdmin) {
        req.flash("error_messages", "禁止變更管理者權限");
        res.redirect("back");
      } else {
        user.update({ isAdmin: !isAdmin }).then((user) => {
          req.flash("success_messages", "使用者權限變更成功");
          res.redirect("/admin/users");
        });
      }
    });
  },
};

module.exports = adminController;
