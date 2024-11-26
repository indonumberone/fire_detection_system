import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Flame, Thermometer, Droplets, Radiation } from "lucide-react";
import Header from "../Components/common/Header";
import StatCard from "../Components/common/StatCard";
import Linechart2 from "../Components/chartandgraph/Linechart2";
import { Piechart } from "../Components/chartandgraph/Piechart";
import Histogram2 from "../Components/chartandgraph/Histogram2";
import Histogram from "../Components/chartandgraph/Histogram";
import Table from "../Components/chartandgraph/Table";
const Home = () => {
  const [isStatusView, setIsStatusView] = useState(false);
  const [liveData, setLiveData] = useState({});
  const socketRef = useRef(null);
  console.log("jalannnnnnnnn woiiiii");

  useEffect(() => {
    socketRef.current = new WebSocket("ws://34.142.249.25:1880/testing");

    socketRef.current.onopen = () => {
      console.log("Koneksi WebSocket berhasil!");
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      setLiveData(receivedData);
      console.log(receivedData?.sensors?.flame);
    };
    const interval = setInterval(() => {
      setIsStatusView((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      key: "temperature",
      name: "Temperature",
      icon: Thermometer,
      value: isStatusView
        ? liveData.risk?.temperature_risk || "N/A"
        : liveData.sensors?.temperature || "N/A",
      color: "#6366F1",
    },
    {
      key: "humidity",
      name: "Humidity",
      icon: Droplets,
      value: isStatusView
        ? liveData.risk?.humidity_risk || "N/A"
        : `${liveData.sensors?.humidity || "N/A"} %`,
      color: "#10B981",
    },
    {
      key: "gas",
      name: "Gas",
      icon: Radiation,
      value: isStatusView
        ? liveData.risk?.gas_risk || "N/A"
        : `${String(liveData.sensors?.gas) || "N/A"} Ppm`,
      color: "#F59E0B",
    },
    {
      key: "flame",
      name: "Api",
      icon: Flame,
      value: isStatusView
        ? liveData.risk?.flame_risk || "N/A"
        : `${String(liveData?.sensors?.flame) || "N/A"}`,
      color: "#EF4444",
    },
  ];

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Overview" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <AnimatePresence mode="wait">
            {statCards.map((card, key) => (
              <motion.div
                key={isStatusView ? `${card.key}-risk` : card.key}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <StatCard
                  name={isStatusView ? `${card.key} risk` : card.key}
                  icon={card.icon}
                  value={card.value}
                  color={card.color}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Linechart2
            title={"FLAME API"}
            field={"flame"}
            _measurement={"sensors"}
            color={"#b300ff"}
          />
          <Linechart2
            title={"TEMPERATURE"}
            field={"temperature"}
            _measurement={"sensors"}
            color={"#5ce7f6"}
          />
          <Linechart2
            title={"Humidity"}
            field={"humidity"}
            _measurement={"sensors"}
            color={"#ff0000"}
          />
          <Linechart2
            title={"GAS"}
            field={"gas"}
            _measurement={"sensors"}
            color={"#00ff0d"}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-5">
          <Piechart title={"Risk Levels"} />
          <Histogram />
        </div>
        <div className="mt-5">
          <Table title={"Table Status"} />
        </div>
      </main>
    </div>
  );
};

export default Home;
