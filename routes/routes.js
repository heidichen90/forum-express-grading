const express = require("express");
const router = express.Router();

const restController = require("../controllers/restController");
const adminController = require("../controllers/adminController");
const userController = require("../controllers/userController");
const commentController = require("../controllers/commentController");
const categoryController = require("../controllers/categoryController");
const restControllers = require("../controllers/restController");
const passport = require("passport");
const helpers = require("../_helpers");

// multer setup
const multer = require("multer");
const upload = multer({ dest: "temp/" });

const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    return next();
  }
  res.redirect("/signin");
};

const authenticatedAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) {
      return next();
    }
    return res.redirect("/");
  }
  res.redirect("/signin");
};

// 如果使用者訪問首頁，就導向 /restaurants 的頁面
router.get("/", authenticated, (req, res) => {
  res.redirect("restaurants");
});
router.get("/restaurants", authenticated, restController.getRestaurants);

router.get("/admin", authenticatedAdmin, (req, res) => {
  res.redirect("/admin/restaurants");
});
router.get(
  "/admin/restaurants",
  authenticatedAdmin,
  adminController.getRestaurants
);

router.get("/signup", userController.signUpPage);
router.post("/signup", userController.signUp);

router.get("/signin", userController.signInPage);
router.post(
  "/signin",
  passport.authenticate("local", {
    failureRedirect: "/signin",
    failureFlash: true,
  }),
  userController.signIn
);
router.get("/logout", userController.logout);
router.get(
  "/admin/restaurants/create",
  authenticatedAdmin,
  adminController.createRestaurants
);
router.post(
  "/admin/restaurants",
  authenticatedAdmin,
  upload.single("image"),
  adminController.postRestaurants
);
router.get(
  "/admin/restaurants/:id",
  authenticatedAdmin,
  adminController.getRestaurant
);
router.get(
  "/admin/restaurants/:id/edit",
  authenticatedAdmin,
  adminController.editRestaurant
);
router.put(
  "/admin/restaurants/:id",
  authenticatedAdmin,
  upload.single("image"),
  adminController.putRestaurant
);
router.delete(
  "/admin/restaurants/:id",
  authenticatedAdmin,
  adminController.deleteRestaurant
);
router.get("/admin/users", authenticatedAdmin, adminController.getUsers);
router.put(
  "/admin/users/:id/toggleAdmin",
  authenticatedAdmin,
  adminController.toggleAdmin
);
router.get(
  "/admin/categories",
  authenticatedAdmin,
  categoryController.getCategories
);
router.post(
  "/admin/categories",
  authenticatedAdmin,
  categoryController.postCategory
);
router.get(
  "/admin/categories/:id",
  authenticatedAdmin,
  categoryController.getCategories
);
router.put(
  "/admin/categories/:id",
  authenticatedAdmin,
  categoryController.putCategory
);
router.delete(
  "/admin/categories/:id",
  authenticatedAdmin,
  categoryController.deletCategory
);
router.get("/restaurants/feeds", authenticated, restController.getFeeds);
router.get("/restaurants/top", authenticated, restController.getTopRestaurant);
router.get("/restaurants/:id", authenticated, restController.getRestaurant);
router.post("/comments", authenticated, commentController.postComment);
router.delete("/comments/:id", authenticated, commentController.deleteComment);
router.get("/users/top", authenticated, userController.getTopUser);
router.get("/users/:id", authenticated, userController.getUser);
router.get("/users/:id/edit", authenticated, userController.editUser);
router.put(
  "/users/:id",
  authenticated,
  upload.single("image"),
  userController.putUser
);
router.get(
  "/restaurants/:id/dashboard",
  authenticated,
  restControllers.getDashBoard
);
router.post(
  "/favorite/:restaurantId",
  authenticated,
  userController.addFavorite
);
router.delete(
  "/favorite/:restaurantId",
  authenticated,
  userController.removeFavorite
);
router.post("/like/:restaurantId", authenticated, userController.addLike);
router.delete("/like/:restaurantId", authenticated, userController.removeLike);
router.post("/following/:userId", authenticated, userController.addFollowing);
router.delete(
  "/following/:userId",
  authenticated,
  userController.removeFollowing
);

module.exports = router;
