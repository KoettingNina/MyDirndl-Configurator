import patternPunkte from "../../images/patternPunkte-Photoroom-modified.png";
import patternBlümchen from "../../images/trachtenBlumen-Photoroom-modified.png";
import patternKariert from "../../images/transparent_checkered_pattern_with_semi.png";
import noneImage from "../../images/none.png";
import flowersThumbnail from "../../images/blumenThumbnail.jpg";
import dotsThumbnail from "../../images/punkteThumbnail.jpg";
import checkeredThumbnail from "../../images/kariertThumbnail.jpg";

export const colorOptions = [
  { id: "Black", color: "#000000", price: 0 },
  { id: "White", color: "#ffffff", price: 0 },
  { id: "Yellow", color: "#ffd044", price: 10 },
  { id: "Blue", color: "#0023ed", price: 5 },
  { id: "Red", color: "#a50013", price: 5 },
  { id: "Green", color: "#297f1e", price: 5 },
  { id: "Pink", color: "#c900bf", price: 10 },
];

export const patterns = [
  { id: "No Pattern", src: "", thumbnail: noneImage, price: 0 },
  {
    id: "Flowers",
    src: patternBlümchen,
    thumbnail: flowersThumbnail,
    price: 5,
  },
  {
    id: "Checkered",
    src: patternKariert,
    thumbnail: checkeredThumbnail,
    price: 5,
  },
  { id: "Dots", src: patternPunkte, thumbnail: dotsThumbnail, price: 10 },
];

export const necklinePrices = {
  "v-neck": 10,
  "box-neck": 0,
};

export const lengthPrices = {
  Long: 20,
  Midi: 0,
};

export const basePrice = 150;
