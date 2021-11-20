Skip to content
Search or jump to…
Pull requests
Issues
Marketplace
Explore
 
@heidichen90 
heidichen90
/
forum-express-grading
Public
forked from ALPHACamp/forum-express-grading
0
045
Code
Pull requests
Actions
Projects
Wiki
Security
Insights
Settings
forum-express-grading/controllers/restController.js /
@heidichen90
heidichen90 merge with R02 and correct styling
Latest commit ece32bf 1 hour ago
 History
 1 contributor
100 lines (87 sloc)  2.37 KB
   
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const Comment = db.Comment

const pageLimit = 10

const restControllers = {
  getRestaurants: (req, res) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ''

    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit
    }).then((restaurants) => {
      // data for pagination
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(restaurants.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map(
        (item, index) => index + 1
      )

      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1

      const data = restaurants.rows.map((r) => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.dataValues.Category.name
      }))
      Category.findAll({ raw: true, nest: true }).then((categories) => {
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next
        })
      })
    })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category, { model: Comment, include: User }]
    }).then((restaurant) => {
      return res.render('restaurant', {
        restaurant: restaurant.toJSON()
      })
    })
  },

  getFeeds: async (req, res) => {

    try {
      const restaurants = await Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      })

      const comments = await Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })

      return res.render('feeds', {
        restaurants,
        comments
      })
    } catch (error) {
      console.log('Error: ', error)
    }
  },

}

module.exports = restControllers