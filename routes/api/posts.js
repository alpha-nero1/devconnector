const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const validate_post = require("../../validation/post");

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

const router = express.Router();

// @route   GET api/posts
// @desc    get all posts
// @access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

// @route   POST api/posts
// @desc    create post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, is_valid } = validate_post(req.body);

    if (!is_valid) {
      return res.status(400).json(errors);
    }
    const new_post = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    new_post.save().then(post => res.json(post));
  }
);

// @route   GET api/posts/:id
// @desc    delete a post
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        // Check for the post owner
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notauthorised: "User not authorised" });
        }

        post
          .remove()
          .then(() => res.json({ success: true }))
          .catch(err =>
            res.status(404).json({ postnotfound: "Post not found" })
          );
      });
    });
  }
);

// @route   GET api/posts/:id
// @desc    get post by id
// @access  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(() =>
      res.status(404).json({ nopostfound: "No post found with that id" })
    );
});
module.exports = router;

// @route   POST api/posts/like/:id
// @desc    like a post
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check if user has liked post
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            res
              .status(400)
              .json({ already_liked: "User already liked this post" });
          }

          // Add user id to likes array
          post.likes.unshift({ user: req.body.user });
          post.save().then(post => res.json(post));
        })
        .catch(() =>
          res.status(404).json({ nopostfound: "No post found with that id" })
        );
    });
  }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check if user has liked post
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            res
              .status(400)
              .json({ not_liked: "User has not liked this post." });
          }

          // get remove index of like
          const remove_index = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          post.likes.splice(remove_index, 1);
          post.save().then(post => res.json(post));
        })
        .catch(() =>
          res.status(404).json({ nopostfound: "No post found with that id" })
        );
    });
  }
);

// @route   POST api/posts/comment/:id
// @desc    Add comment to post.
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Post and comment validation is the same so we can re-use validate_post.
    const { errors, is_valid } = validate_post(req.body);

    if (!is_valid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const new_comment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to post comments array
        post.comments.unshift(new_comment);
        post.save().then(post => res.json(post));
      })
      .catch(() =>
        res
          .status(404)
          .json({ post_not_found: "No post found to add comment." })
      );
  }
);

// @route   DELTE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post.
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check to see comment exists.
        if (
          post.comments.filter(
            comment => comment.id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ comment_not_existant: "Comment does not exist" });
        }

        const remove_index = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        post.comments.splice(remove_index, 1);
        post.save().then(post => res.json(post));
      })
      .catch(() =>
        res
          .status(404)
          .json({ post_not_found: "No post found to remove comment." })
      );
  }
);

module.exports = router;
