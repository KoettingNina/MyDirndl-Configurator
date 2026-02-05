import mongoose from "mongoose";
import multer from "multer";
import InspirationPost from "../models/inspirationPostModel.js";
import Customer from "../models/customerModel.js";
import Dirndl from "../models/dirndlModel.js";
///
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

//POST ROUTE /api/inspirationPosts/create
const createInspirationPost = async (req, res) => {
  try {
    const wornPicture = req.file.path;

    const { orderItemConnection, likes, creationDate } = req.body;

    const inspirationPostExists = await InspirationPost.exists({
      orderItemConnection,
    });
    if (inspirationPostExists) {
      throw new Error("Inspiration post already exists");
    }

    const newInspirationPost = await InspirationPost.create({
      orderItemConnection,
      likes,
      creationDate,
      wornPicture,
    });

    const savedPost = await newInspirationPost.save();

    res.status(201).json({
      message: "Inspiration post created successfully",
      savedPost,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//DELETE ROUTE /api/inspirationPosts/delete/:postId
const deleteInspirationPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const inspirationPost = await InspirationPost.findById(postId);

    if (!inspirationPost) {
      throw new Error("Inspiration post not found");
    }

    const __filename = fileURLToPath(import.meta.url);

    const __dirname = path.dirname(__filename);

    //delete file from the static folder

    const fileName = inspirationPost.wornPicture;

    // Construct the full path to the file
    const filePath = path.join(
      __dirname, // The directory name of the current module
      "../uploads",
      path.basename(fileName)
    );

    // Delete the file using fs.unlink
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        throw new Error("Error deleting file");
      }
    });

    await InspirationPost.findByIdAndDelete(postId);

    res.status(200).json({ message: "Inspiration post deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//GET ROUTE /api/inspirationPosts/getPosts/:userId
const getInspirationPostOfUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const inspirationPosts = await InspirationPost.find({
      postingUser: userId,
    });

    res.status(200).json(inspirationPosts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//GET ROUTE /api/inspirationPosts/all
const getAllInspirationPosts = async (req, res) => {
  try {
    const { sortBy, order } = req.query;
    const sortOrder = order === "desc" ? -1 : 1;
    const sortField = sortBy === "likes" ? "likes" : "creationDate";

    const posts = await InspirationPost.find()
      .populate({
        path: "orderItemConnection",
        populate: {
          path: "dirndl",
          model: "Dirndl",
        },
      })
      .sort({ [sortField]: sortOrder });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

//GET ROUTE /api/inspirationPosts/:orderItemId
// get all inspiration posts from order item
const getInspirationPostByOrderItem = async (req, res) => {
  try {
    const { orderItemId } = req.params;

    const inspirationPost = await InspirationPost.findOne({
      orderItemConnection: orderItemId,
    });

    if (!inspirationPost) {
      return res.status(200).json(null);
      //return res.status(404).json({ error: "Inspiration post not found" });
    }

    res.status(200).json(inspirationPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE PUT /api/inspirationPosts/:id/like
//user likes a post - is added to favoriteList of user
const likePost = async (req, res) => {
  //TODO get userID
  const { customerId } = req.body;

  const inspirationId = req.params.id;

  try {
    const user = await Customer.findById(customerId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.favoriteList.includes(inspirationId)) {
      // If the post has already been liked, unlike it

      user.favoriteList = user.favoriteList.filter(
        (id) => id.toString() !== inspirationId.toString()
      );
      await InspirationPost.findByIdAndUpdate(inspirationId, {
        $inc: { likes: -1 },
      });
    } else {
      // If the post has not yet been liked, like it
      user.favoriteList.push(inspirationId);
      await InspirationPost.findByIdAndUpdate(inspirationId, {
        $inc: { likes: 1 },
      });
    }

    await user.save();
    const updatedInspiration = await InspirationPost.findById(inspirationId);
    res.json(updatedInspiration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createInspirationPost,
  deleteInspirationPost,
  getInspirationPostOfUser,
  getAllInspirationPosts,
  getInspirationPostByOrderItem,
  likePost,
};
