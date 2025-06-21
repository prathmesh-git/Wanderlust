const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const {isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listingsController.js")
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


// Index Route & Create route

router.route("/")
    .get(wrapAsync (listingController.index))
    .post(
        validateListing,
        isLoggedIn, 
        upload.single("listing[image]"),
        wrapAsync(listingController.createListing)
    );


//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm );

//Show, update & delete route
router.route("/:id")
    .get( wrapAsync(listingController.showListing))
    .put( 
        validateListing, 
        isLoggedIn, 
        isOwner, 
        upload.single("listing[image]"),
        wrapAsync(listingController.updateListing))
    .delete( isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));



//EDIT ROUTE

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm))


module.exports = router;