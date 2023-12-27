const Listing = require("../Models/Listing");
const mbxgeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const maptoken = process.env.MAP_TOKEN;
const geocodingClient = mbxgeocoding({ accessToken: maptoken });

module.exports.index = async (req, res) => {
  // Fetch all listings from the database
  const allListings = await Listing.find({});
  res.render("Listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  console.log(req.user);
  res.render("Listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;
  // Fetch a specific listing by ID
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("failure", "Listing Does Not Exist!");
    res.redirect("/listings");
    // Handle the case where the listing is not found
    return next(new ExpressError(404, "Listing not found"));
  }

  console.log(listing);
  // Render the details of the listing
  res.render("Listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  // Validate the listing data and create a new listing
  const newListing = new Listing(req.body.listing);
  newListing.image = { url, filename };
  newListing.owner = req.user._id;
  newListing.geometry = response.body.features[0].geometry;
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created!");
  // Redirect to the listings page after creating a new listing
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;
  // Fetch the listing to be edited
  const listing = await Listing.findById(id);

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  // Update the listing with the new data
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = { url, filename };

    await listing.save();
  }

  req.flash("success", " Listing Updated Successfully!");
  // Redirect to the listings page after updating
  res.redirect("/listings");
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  // Delete the specified listing
  await Listing.findByIdAndDelete(id);
  req.flash("success", " Listing Deleted Successfully!");
  // Redirect to the listings page after deleting
  res.redirect("/listings");
};
