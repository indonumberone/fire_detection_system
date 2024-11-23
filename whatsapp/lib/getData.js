import axios from "axios";

export const getData = async (param) => {
  const data = await axios.get(`http://node-red:1880/getData${param}`);
  // console.log(data);
  return data;
};

// getData("Pasca");
