import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseDataToTable } from "../../utils/parseDataToTable";

export const TableRisk = ({ title }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dataResults, setDataResults] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [time, setTime] = useState("10m");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10; 
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const fetchData = async () => {
      const data = await parseDataToTable(time, startDate, endDate);
      setDataResults(data);
      filterData(searchTerm, data);
    };
    fetchData();
  }, [time, startDate, endDate]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterData(term, dataResults);
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const handleChangeTime = (e) => {
    setTime(e.target.value);
  };

  const filterData = (term, data) => {
    const filtered = data.filter((value) => {
      const matchesTerm = term
        ? value.status.toLowerCase().includes(term) ||
          value.date.toLowerCase().includes(term) ||
          value.time.toLowerCase().includes(term)
        : true;
      return matchesTerm;
    });

    const sortedFiltered = filtered.sort((a, b) => b.timestamp - a.timestamp);
    setFilteredData(sortedFiltered);
    setCurrentPage(0); 
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const indexOfFirstItem = currentPage * itemsPerPage;
  const currentData = filteredData.slice(
    indexOfFirstItem,
    indexOfFirstItem + itemsPerPage
  );

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
        <div className="flex items-center space-x-4">
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            placeholderText="Pilih rentang tanggal"
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-3 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            className="bg-gray-700 text-white rounded-md mx-2 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChangeTime}
            value={time}
          >
            <option value="60s">1 minute</option>
            <option value="5m">5 minutes</option>
            <option value="10m">10 minutes</option>
            <option value="15m">15 minutes</option>
            <option value="30m">30 minutes</option>
            <option value="1h">1 hour</option>
          </select>
          <div className="relative">
            <input
              type="text"
              placeholder="Search KOBONGAN"
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {currentData.map((value, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      value.status === "NORMAL"
                        ? "bg-green-100 text-green-800"
                        : value.status === "WARNING"
                        ? "bg-yellow-100 text-yellow-800"
                        : value.status === "DANGER"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {value.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {value.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {value.time}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        breakLabel={"..."}
        pageCount={Math.ceil(filteredData.length / itemsPerPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={"pagination flex justify-center mt-4 space-x-2"}
        activeClassName={"bg-blue-500 text-white rounded-md px-2 py-1"}
        pageClassName={"bg-gray-700 text-white rounded-md px-2 py-1"}
        previousClassName={"bg-gray-700 text-white rounded-md px-2 py-1"}
        nextClassName={"bg-gray-700 text-white rounded-md px-2 py-1"}
      />
    </motion.div>
  );
};


