import mongoose from "mongoose";
import Dirndl from "../models/dirndlModel.js";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

//ROUTE GET /api/dirndl/get/:id
// Id des Dirndl wird bestimmt aus den Konfigurationen eines Dirndls
const getDirndl = async (req, res) => {
  try {
    const dirndlId = req.params.id;
    const dirndl = await Dirndl.findById(dirndlId);
    if (!dirndl) {
      throw new Error("Dirndl not found");
    }
    res.status(200).json(dirndl);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE POST /api/dirndl/create
// könnte gebraucht werden, damit wir einmal alle erstellen, z.B. über ein Skript
const createDirndl = async (req, res) => {
  try {
    const { skirt, apron, dirndlBluse, bodice, price } = req.body;
    const newDirndl = await Dirndl.create({
      skirt,
      apron,
      dirndlBluse,
      bodice,
      price,
    });
    const existingDirndl = await Dirndl.findOne({
      skirt,
      apron,
      dirndlBluse,
      bodice,
      price,
    });
    if (existingDirndl) {
      throw new Error("Dirndl with the same values already exists");
    }
    res.status(201).json(newDirndl);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const saveDirndl = async (req, res) => {
  try {
    console.log(req.body);
    const {
      Length,
      Neck,
      topColor,
      bottomColor,
      apronColor,
      topPattern,
      bottomPattern,
      apronPattern,
      price,
    } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    console.log("imageP", imagePath);
    const newDirndl = new Dirndl({
      Length,
      Neck,
      topColor,
      bottomColor,
      apronColor,
      topPattern,
      bottomPattern,
      apronPattern,
      image: imagePath,
      price,
    });

    await newDirndl.save();
    res.status(201).json(newDirndl);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE DELETE /api/dirndl/delete/:dirndlId
const deleteDirndl = async (req, res) => {
  console.log("inside deleteDirndl");
  try {
    const { dirndlId } = req.params;

    console.log("deleteDirndl", dirndlId);

    //find the dirndl to get the image path before deleting
    const dirndl = await Dirndl.findById(dirndlId);

    if (!dirndl) {
      return res.status(404).json({ message: "Dirndl not found" });
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const fileName = dirndl.image;
    console.log(fileName);
    const filePath = path.join(
      __dirname,
      "../uploads",
      path.basename(fileName)
    );

    console.log(filePath);

    //delete the dirndl image
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        throw new Error("Error deleting file");
      }
    });

    //delete the dirndl object
    await Dirndl.findByIdAndDelete(dirndlId);

    res.status(200).json({ message: "Dirndl deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting dirndl", error });
  }
};

export { getDirndl, createDirndl, saveDirndl, deleteDirndl };
