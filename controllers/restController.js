const db = require("../models");
const Restaurant = db.Restaurant;
const Category = db.Category;
const User = db.User;
const Comment = db.Comment;

const pageLimit = 10;

const restControllers = {
  getRestaurants: (req, res) => {
    let offset = 0;
    const whereQuery = {};
    let categoryId = "";

    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId);
      whereQuery.CategoryId = categoryId;
    }
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit;
    }

    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit,
    }).then((restaurants) => {
      // data for pagination
      const page = Number(req.query.page) || 1;
      const pages = Math.ceil(restaurants.count / pageLimit);
      const totalPage = Array.from({ length: pages }).map(
        (item, index) => index + 1
      );

      const prev = page - 1 < 1 ? 1 : page - 1;
      const next = page + 1 > pages ? pages : page + 1;

      const data = restaurants.rows.map((r) => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.dataValues.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(
          (restaurant) => restaurant.id
        ).includes(r.id), // narrow down from all favorited restaurants to current restaurant
      }));
      Category.findAll({ raw: true, nest: true }).then((categories) => {
        return res.render("restaurants", {
          restaurants: data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next,
        });
      });
    });
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] },
        { model: User, as: "FavoritedUsers" },
      ],
    }).then((restaurant) => {
      const isFavorited = restaurant.FavoritedUsers.map(
        (user) => user.id
      ).includes(req.user.id);
      restaurant.increment("viewCounts");
      return res.render("restaurant", {
        restaurant: restaurant.toJSON(),
        isFavorited: isFavorited,
      });
    });
  },

  getFeeds: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [["createdAt", "DESC"]],
        include: [Category],
      });

      const comments = await Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [["createdAt", "DESC"]],
        include: [User, Restaurant],
      });

      return res.render("feeds", {
        restaurants,
        comments,
      });
    } catch (error) {
      console.log("Error: ", error);
    }
  },

  getDashBoard: async (req, res) => {
    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findByPk(restaurantId, {
      include: [Category, { model: Comment }],
    });
    return res.render("dashboard", { restaurant: restaurant.toJSON() });
  },
};

module.exports = restControllers;
