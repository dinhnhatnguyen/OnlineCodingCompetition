import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ProblemTable from "../components/problems/ProblemTable";
import { getProblems } from "../api/problemsApi";

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProblems()
      .then((data) => {
        setProblems(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load problems");
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header />
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <ProblemTable problems={problems} />
      )}
      <Footer />
    </div>
  );
};

export default Problems;
