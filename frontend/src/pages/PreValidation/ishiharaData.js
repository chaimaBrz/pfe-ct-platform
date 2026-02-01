import plate01 from "../../assets/ishihara/plate01.png";
import plate02 from "../../assets/ishihara/plate02.jpg";
import plate03 from "../../assets/ishihara/plate03.jpg";
import plate04 from "../../assets/ishihara/plate04.jpg";

export const ISHIHARA_PLATES = [
  {
    id: "plate01",
    image: plate01,
    question: "Quel nombre voyez-vous ?",
    options: ["12", "8", "21", "Rien"],
    answer: "21",
  },
  {
    id: "plate02",
    image: plate02,
    question: "Quel nombre voyez-vous ?",
    options: ["29", "70", "12", "Rien"],
    answer: "12",
  },
  {
    id: "plate03",
    image: plate03,
    question: "Quel nombre voyez-vous ?",
    options: ["5", "3", "8", "Rien"],
    answer: "8",
  },
  {
    id: "plate04",
    image: plate04,
    question: "Quel nombre voyez-vous ?",
    options: ["16", "17", "74", "Rien"],
    answer: "16",
  },
];

export const ISHIHARA_PASS_MIN = 3;
