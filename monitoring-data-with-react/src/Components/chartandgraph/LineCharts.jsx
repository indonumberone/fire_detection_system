// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { useState } from "react";
// import { motion } from "framer-motion";

// const salesData = [
//   { name: "Jul", sales: 4200 },
//   { name: "Aug", sales: 3800 },
//   { name: "Sep", sales: 5100 },
//   { name: "Oct", sales: 4600 },
//   { name: "Nov", sales: 5400 },
//   { name: "Dec", sales: 7200 },
//   { name: "Jan", sales: 6100 },
//   { name: "Feb", sales: 5900 },
//   { name: "Mar", sales: 6800 },
//   { name: "Apr", sales: 6300 },
//   { name: "May", sales: 7100 },
//   { name: "Jun", sales: 7500 },
// ];

// const Linechart = () => {
//   const [selectedTimeRange, setSelectedTimeRange] = useState("This Month");

//   return (
//     <motion.div
//       className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.2 }}
//     >
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-semibold text-gray-100">
//           Revenue vs Target
//         </h2>
//         <select
//           className="bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={selectedTimeRange}
//           onChange={(e) => setSelectedTimeRange(e.target.value)}
//         >
//           <option>This Week</option>
//           <option>This Month</option>
//           <option>This Quarter</option>
//           <option>This Year</option>
//         </select>
//       </div>

//       <div className="h-80">
//         <ResponsiveContainer width={"100%"} height={"100%"}>
//           <LineChart data={salesData}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
//             <XAxis dataKey={"name"} stroke="#9ca3af" />
//             <YAxis stroke="#9ca3af" />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: "rgba(31, 41, 55, 0.8)",
//                 borderColor: "#4B5563",
//               }}
//               itemStyle={{ color: "#E5E7EB" }}
//             />
//             <Line
//               type="monotone"
//               dataKey="sales"
//               stroke="#6366F1"
//               strokeWidth={3}
//               dot={{ fill: "#6366F1", strokeWidth: 2, r: 6 }}
//               activeDot={{ r: 8, strokeWidth: 2 }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </motion.div>
//   );
// };
// export default Linechart;
