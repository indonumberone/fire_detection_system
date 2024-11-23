function generateRandomHexColor() {
  const randomColor =
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0");
  return randomColor;
}
export default generateRandomHexColor;
