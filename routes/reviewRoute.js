const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js")
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviewsController.js")

//reviews
//post Route
router.post("/", validateReview, isLoggedIn, wrapAsync(reviewController.createReview)); 

//review delete Route
router.delete(
    "/:reviewId", isLoggedIn, isReviewAuthor,
    wrapAsync(reviewController.destroyReview));

module.exports = router;