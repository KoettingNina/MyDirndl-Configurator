import jwt from "jsonwebtoken";
import CustomerAccount from "../models/customerModel.js";
import TailorAccount from "../models/tailorModel.js";

const checkAuth = async (req, res, next) => {
  try {
    console.log("die request auf frontend :", req.cookies.jwt);
    let token = req.cookies.jwt;
    if (!token) {
      res
        .status(401)
        .json({ error: "Unauthorized", message: "No JWT provided!" });
    } else {
      const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await CustomerAccount.findById(verifiedToken.userId);
      const tailor = await TailorAccount.findById(verifiedToken.tailorId);
      const cookieuser = req.cookies.user;
      console.log("Tailor im backend sollte sein: ", tailor);
      console.log("User im backend sollte sein: ", user);

      if (user && user._id.toString() === cookieuser.toString()) {
        //res.status(200).json({ message: "Authorized", user: req.user});
        req.user = {
          _id: user._id,
        };
        next();
      } else if (tailor && tailor._id.toString() === cookieuser.toString()) {
        req.user = {
          _id: tailor._id,
          isTailor: tailor.isTailor, // assuming there's an `isTailor` property
        };
        next();
      } else {
        res
          .status(401)
          .json({ error: "Unauthorized", message: "JWT invalid!" });
        //next();
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { checkAuth };
