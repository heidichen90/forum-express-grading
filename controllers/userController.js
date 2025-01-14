const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const helpers = require('../_helpers')
// imgur setup
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (_req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    const { name, email, password, passwordCheck } = req.body
    if (password !== passwordCheck) {
      req.flash('error_messages', '兩次密碼輸入不同')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email } }).then((user) => {
        if (user) {
          req.flash('error_messages', '信箱已經註冊過')
          return res.redirect('/signup')
        } else {
          User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
          }).then((_user) => {
            req.flash('success_messages', '成功註冊帳號')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (_req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_message', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: async (req, res) => {
    try {
      const isEditable =
        helpers.getUser(req).id === Number(req.params.id) || false

      const user = await User.findByPk(req.params.id, {
        raw: true,
        nest: true
      })

      const comments = await Comment.findAll({
        raw: true,
        nest: true,
        where: { UserId: req.params.id },
        include: [Restaurant]
      })

      return res.render('profile', {
        user,
        comments,
        isEditable
      })
    } catch (error) {
      console.log(error)
    }
  },
  editUser: (req, res) => {
    // can only edit your own profile
    if (helpers.getUser(req).id !== Number(req.params.id)) {
      req.flash(
        'error_messages',
        '無法更改其他使用者資料，只可以瀏覽其他使用者資料'
      )
      return res.redirect(`/users/${req.params.id}`)
    }

    return User.findByPk(req.params.id).then((user) => {
      return res.render('edit', { user: user.toJSON() })
    })
  },
  putUser: (req, res) => {
    const { name, email } = req.body
    const { file } = req

    if (helpers.getUser(req).id !== Number(req.params.id)) {
      req.flash('error_messages', '無法更改其他使用者資料，請重新編輯你的資料')
      return res.redirect('back')
    }
    if (!name || !email) {
      req.flash('error_messages', '使用者資料沒有變更')
      return res.redirect('back')
    }

    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) console.log('Error: ', err)
        return User.findByPk(req.params.id).then((user) => {
          user
            .update({
              name,
              email,
              image: file ? img.data.link : user.image
            })
            .then((_user) => {
              req.flash('success_messages', '使用者資料編輯成功')
              return res.redirect(`/users/${req.params.id}`)
            })
        })
      })
    } else {
      return User.findByPk(req.params.id).then((user) => {
        user
          .update({
            name,
            email
          })
          .then((_user) => {
            req.flash('success_messages', '使用者資料編輯成功')
            return res.redirect(`/users/${req.params.id}`)
          })
      })
    }
  },
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    }).then((_restaurant) => {
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res) => {
    return Favorite.destroy({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then((_d) => {
      return res.redirect('back')
    })
  },
  addLike: (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    }).then((_restaurant) => {
      return res.redirect('back')
    })
  },
  removeLike: (req, res) => {
    return Like.destroy({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    }).then((_d) => {
      return res.redirect('back')
    })
  },
  getTopUser: (req, res) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    }).then((users) => {
      users = users.map((user) => ({
        ...user.dataValues,
        followerCount: user.Followers.length,
        isFollowed: helpers
          .getUser(req)
          .Followings.filter((following) => following.id === user.id).length
      }))
      users = users.sort((a, z) => z.followerCount - a.followerCount)
      return res.render('topUser', { users })
    })
  },

  addFollowing: (req, res) => {
    console.log(req.user.Id, req.params.userId)
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    }).then((followship) => {
      return res.redirect('back')
    })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then((followship) => {
      followship.destroy().then((followship) => {
        return res.redirect('back')
      })
    })
  }
}

module.exports = userController
