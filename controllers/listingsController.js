require("dotenv").config();
const Listing = require("../models/listings.js");
const maptilerClient = require('@maptiler/client');
const mapToken = process.env.MAPTILER_API_KEY; 
const geocoding = maptilerClient.geocoding;
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm =  (req, res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews", 
        populate: {
            path: "author",
        }
    })
    .populate("owner");
    if(!listing) {
        req.flash("error", "Requested listing does not exists");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing, maptilerApiKey: mapToken });
    console.log("Server mapToken:", mapToken);

}

module.exports.createListing = async (req, res, next) => {
  try {
    const locationQuery = req.body.listing.location?.trim();

    if (!locationQuery) {
      req.flash("error", "Location is required.");
      return res.redirect("/listings/new");
    }

    // Call MapTiler geocoding API
    const response = await geocoding.forward(locationQuery, { limit: 1 });

    // Log full response for debugging
    console.log("🔍 MapTiler Response:", JSON.stringify(response?.body, null, 2));

    const feature = response?.features?.[0];


    if (!feature) {
      console.warn("❌ No geocoding features found for:", locationQuery);
      req.flash(
        "error",
        `Could not find coordinates for "${locationQuery}". Try being more specific (e.g., with a postal code or country).`
      );
      return res.redirect("/listings/new");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Set image if uploaded
    if (req.file?.path && req.file?.filename) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // Save geometry from geocoding result
    newListing.geometry = feature.geometry;

    const savedListing = await newListing.save();
    console.log("✅ Saved listing:", savedListing);

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    console.error("🚨 Error creating listing:", err);
    next(err); // Forward to Express error handler
  }
};


module.exports.renderEditForm = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
      if(!listing) {
        req.flash("error", "Requested listing does not exists");
        return res.redirect("/listings");
        }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
    
}

module.exports.updateListing = async (req, res)=>{
    let {id} = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    console.log(updatedListing);

    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename  = req.file.filename;
    updatedListing.image = {url, filename};
    await updatedListing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect("/listings")
}

module.exports.destroyListing = async (req, res)=>{
    let {id} = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id)
   console.log(deletedListing);
   req.flash("success", "Listing Deleted!");
   return res.redirect("/listings")

}