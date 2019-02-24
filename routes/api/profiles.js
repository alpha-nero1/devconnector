const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

// Load validator.
const profile_validator = require("../../validation/profile");

// Load add experience validator.
const experience_validator = require("../../validation/experience");

// Load add education validator.
const education_validator = require("../../validation/education.js");

// Load profile model.
const Profile = require("../../models/Profile");

// Load user model.
const User = require("../../models/User");

const router = express.Router();

// @route   GET api/profile
// @desc    gets current users profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { id } = req.user;
    const { errors } = {};

    Profile.findOne({ user: id })
      .populate("User", ["name", "avatar"]) // populate fields from users into the response
      .then(profile => {
        if (!profile) {
          errors.no_profile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   GET api/profile/all
// @desc    get all profiles
// @access  Public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("User", ["name", "avatar"])
    .then(profiles => {
      errors.no_profile = "There are no profiles";
      if (!profiles) return res.status(404).json(errors);

      res.json(profiles);
    })
    .catch(err => res.status.json(err));
});

// @route   GET api/profile/handle/:handle
// @desc    get profile via handle variable
// @access  Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("User", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.no_profile = "There is no profile for this user.";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/user/:user
// @desc    get profile via id variable
// @access  Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.user_id })
    .populate("User", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.no_profile = "There is no profile for this user.";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "there is no profile for this user" })
    );
});

// @route   POST api/profile
// @desc    post req, create or update users profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { body } = req.body;

    const { errors, valid } = profile_validator(req.body);

    if (!valid) return res.status(400).json(errors); // validation block

    // Get Fields
    const profile_fields = {};
    profile_fields.user = body.user;

    if (body.handle) profile_fields.handle = body.handle;
    if (body.company) profile_fields.company = body.company;
    if (body.website) profile_fields.website = body.website;
    if (body.location) profile_fields.location = body.location;
    if (body.bio) profile_fields.bio = body.bio;
    if (body.status) profile_fields.status = body.status;
    if (body.github_username)
      profile_fields.github_username = body.github_username;

    // Need to split skills into an array
    if (typeof body.skills !== "undefined") {
      profile_fields.skills = body.skills.split(",");
    }

    profile_fields.social = {};
    const social = {};
    if (body.youtube) social.youtube = body.youtube;
    if (body.twitter) social.twitter = body.twitter;
    if (body.instagram) social.instagram = body.instagram;
    if (body.linked_in) social.linked_in = body.linked_in;
    if (body.facebook) social.facebook = body.facebook;

    profile_fields.social = social;

    const { id } = req.user;

    Profile.findOne({ user: id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: id },
          { $set: profile_fields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Check if handle exists
        Profile.findOne({ handle: profile_fields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle exists already :/";
            res.status(400).json(errors);
          }

          // Make new profile
          new Profile(profile_fileds).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete("/", passport.authenticate({ session: false }), (req, res) => {
  Profile.findOneAndRemove({ user: req.user.id }).then(() => {
    User.findOneAndRemove({ _id: user.req.id }).then(() =>
      res.json({ success: true })
    );
  });
});

// @route   POST api/profile/add_experience
// @desc    Add an experience to a profile
// @access  Private (Because we need actual user submitting form)
router.post(
  "/add_experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // This is saying: get the members: errors and is_valid from the object returned from the
    // validator and treat them as variables in this scope.
    const { errors, is_valid } = experience_validator(req.body);

    if (!is_valid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const new_experience = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add new experience to experience array of profile
      // * Notice use of 'unshift' here to add to start of array
      profile.experience.unshift(new_experience);
      profile.save().then(profile => {
        res.json(profile);
      });
    });
  }
);

// @route   POST api/profile/add_education
// @desc    Add an education to a profile
// @access  Private (Because we need actual user submitting form)
router.post(
  "/add_education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, is_valid } = education_validator(req.body);

    if (!is_valid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      const new_education = {
        school: req.body.school,
        degree: req.body.degree,
        field_of_study: req.body.field_of_study,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      profile.education.unshift(new_education);
      profile.save().then();
    });
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index

        // Index of the experience we want to remove
        const remove_index = profile.experience
          .map(item => item.id) // map means for each element replace with
          .indexOf(req.params.exp_id); // indexOf returns element of index

        // Splice remove_index out of array.
        profile.experience.splice(remove_index, 1);
        profile.save().then(profile => {
          res.json(profile);
        });
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const remove_index = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        // Splice remove_index out of array.
        profile.education.splice(remove_index, 1);
        profile.save().then(profile => {
          res.json(profile);
        });
      })
      .catch(err => res.status(404).json(err));
  }
);

module.exports = router;
