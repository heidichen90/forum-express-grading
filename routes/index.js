const restControllers = require('../controllers/restControllers')
const adminController = require('../controllers/adminControllers')

module.exports = (app) => {
  // 如果使用者訪問首頁，就導向 /restaurants 的頁面
  app.get('/', (req, res) => {
    res.redirect('restaurants')
  })
  app.get('/restaurants', restControllers.getRestaurants)
  app.get('/admin', (req, res) => {
    res.redirect('/admin/restaurants')
  })
  app.get('/admin/restaurants', adminController.getRestaurants)
}
