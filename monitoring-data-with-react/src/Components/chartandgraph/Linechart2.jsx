import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";
import { parseDataToChart } from "../../utils/parseDataToChart";
import { useEffect } from "react";

function Linechart2({ title, field, _measurement, color }) {
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

  useEffect(() => {
    const fetchData = async () => {
      setDataList(
        await parseDataToChart(time, range, title, field, _measurement)
      );
    };
    fetchData();
    // console.log(liveData);
  }, [time, range]);
  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold flex text-gray-100">{title}</h2>
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
          <LineChart data={dataList}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="x" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={title}
              stroke={color}
              strokeWidth={1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default Linechart2;
