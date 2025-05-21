import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import ContestCard from "./ContestCard";
import { getContests } from "../../api/contestApi";

export default function ContestsList() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;

  useEffect(() => {
    getContests()
      .then((data) => {
        setContests(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load contests");
        setLoading(false);
      });
  }, []);

  const filteredContests = contests.filter(
    (contest) =>
      contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contest.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredContests.length / pageSize);
  const paginatedContests = filteredContests.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  if (loading) {
    return <div className="text-center text-white py-10">Loading...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Contests</h1>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search contests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-zinc-800 border-zinc-700 text-white rounded-md w-full md:w-64"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {paginatedContests.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedContests.map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 text-gray-400 text-sm">
            <span>
              Showing{" "}
              {filteredContests.length === 0 ? 0 : currentPage * pageSize + 1}{" "}
              to{" "}
              {Math.min((currentPage + 1) * pageSize, filteredContests.length)}{" "}
              of {filteredContests.length} results
            </span>
            <div className="flex space-x-2">
              <button
                className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded hover:bg-zinc-700"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`w-8 h-8 flex items-center justify-center rounded ${
                    currentPage === i
                      ? "bg-pink-600 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded hover:bg-zinc-700"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                &gt;
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-zinc-900 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-white mb-2">
            No contests found
          </h3>
          <p className="text-gray-400">
            {searchTerm
              ? "No contests match your search criteria. Try a different search term."
              : "There are no contests available at the moment. Check back soon!"}
          </p>
        </div>
      )}
    </div>
  );
}
