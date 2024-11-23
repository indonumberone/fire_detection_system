import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState, useEffect } from "react";
import { parseDataToPie } from "../../utils/parseDataToPie.js";

// console.log(await parseDataToPie("60s", "7d", "gas", "gas_risk", "risks"));

const label = ["gas_risk", "humidity_risk", "temperature_risk"];

export const Piechart = () => {
  const [dataList, setDataList] = useState([]);
  const [time, setTime] = useState("10m");
  const [range, setRange] = useState("8h");

  const handleChangeTime = async (e) => {
    e.preventDefault();
    setTime(e.target.value);
    console.log(time);
  };

  const handleChangeRange = async (e) => {
    e.preventDefault();
    setRange(e.target.value);
    console.log(range);
  };

  const fetchData = async () => {
    try {
      const data = label.map((item) =>
        parseDataToPie(time, range, item, item, "risks")
      );
      data.push(parseDataToPie(time, range, "flame", "flame", "sensors"));

      const resolvedData = await Promise.all(data);
      setDataList(resolvedData);
      console.log(resolvedData);
    } catch (error) {
      console.error("Error fetching pie chart data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [time, range]);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold flex text-gray-100">sdsdsd</h2>
        <div>
          <select
            className="bg-gray-700 text-white rounded-md mx-2 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleChangeRange(e)}
          >
            <option value="1" selected disabled>
              Select Range
            </option>
            <option value={"1h"}>1 hour </option>
            <option value={"3h"}>3 hour </option>
            <option value={"5h"}>5 hour </option>
            <option value={"8h"}>8 hour </option>
            <option value={"12h"}>12 hour </option>
            <option value={"1d"}>1 day </option>
            <option value={"7d"}>7 day</option>
            <option value={"30d"}>30 day</option>
          </select>
          <select
            className="bg-gray-700 text-white rounded-md mx-2 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleChangeTime(e)}
          >
            <option value="1" selected disabled>
              Select Time
            </option>
            <option value={"60s"}>1 minute</option>
            <option value={"5m"}>5 minute </option>
            <option value={"10m"}>10 minute </option>
            <option value={"15m"}>15 minute </option>
            <option value={"30m"}>30 minute </option>
            <option value={"1h"}>1 hour </option>
          </select>
        </div>
      </div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={dataList}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {dataList.map((value, index) => (
                <Cell key={`cell-${index}`} fill={value.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
