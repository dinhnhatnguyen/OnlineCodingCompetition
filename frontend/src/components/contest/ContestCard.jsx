import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { getRegistrations } from "../../api/contestRegistrationApi";
import ContestCountdown from "./ContestCountdown";
import { LockClosedIcon, GlobeAltIcon } from "@heroicons/react/24/solid";
// import { Button } from "@/components/ui/button";

export default function ContestCard({ contest }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [userRegistration, setUserRegistration] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is registered for this contest
    const checkRegistration = async () => {
      if (user && token && contest.id) {
        setLoading(true);
        try {
          const registrations = await getRegistrations(contest.id, token);
          const userReg = registrations.find(
            (r) => r.username === user.username
          );
          setUserRegistration(userReg || null);
        } catch (error) {
          console.error("Error fetching registration status:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkRegistration();
  }, [user, token, contest.id]);

  const getStatusColor = () => {
    switch (contest.status) {
      case "ONGOING":
        return "bg-green-500";
      case "UPCOMING":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-gray-500";
      case "DRAFT":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation(); // Prevent navigating to details page when button is clicked

    if (contest.status === "ONGOING") {
      // Only allow users with approved registration to join
      if (userRegistration && userRegistration.status === "APPROVED") {
        navigate(`/contests/${contest.id}?tab=problems`);
      } else {
        // Show registration status or indicate they can't join
        navigate(`/contests/${contest.id}`);
      }
    } else {
      // For other statuses, just navigate to contest details
      navigate(`/contests/${contest.id}`);
    }
  };

  const getActionButton = () => {
    // If loading registration status
    if (loading) {
      return (
        <button
          className="bg-gray-700 text-white rounded-md px-4 py-2 w-full opacity-70"
          disabled
        >
          Loading...
        </button>
      );
    }

    // For private contests in UPCOMING or ONGOING status
    if (
      (contest.status === "UPCOMING" || contest.status === "ONGOING") &&
      !contest.public
    ) {
      // If user is not registered or registration was rejected
      if (!userRegistration || userRegistration.status === "REJECTED") {
        return (
          <button
            className="bg-[#722055] hover:bg-[#50153a] text-white rounded-md px-4 py-2 w-full"
            onClick={handleButtonClick}
          >
            Register
          </button>
        );
      }

      // If registration is pending
      if (userRegistration.status === "PENDING") {
        return (
          <button
            className="bg-yellow-600 text-white rounded-md px-4 py-2 w-full cursor-not-allowed"
            disabled
          >
            Registration Pending
          </button>
        );
      }

      // If registration is approved
      if (userRegistration.status === "APPROVED") {
        return (
          <button
            className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 w-full"
            onClick={handleButtonClick}
          >
            {contest.status === "ONGOING" ? "Join Contest" : "View Details"}
          </button>
        );
      }
    }

    // For public contests or other cases
    if (contest.status === "ONGOING") {
      return (
        <button
          className="bg-[#722055] hover:bg-[#50153a] text-white rounded-md px-4 py-2 w-full"
          onClick={handleButtonClick}
        >
          Join Contest
        </button>
      );
    } else if (contest.status === "UPCOMING") {
      return (
        <button
          className="bg-[#722055] hover:bg-[#50153a] text-white rounded-md px-4 py-2 w-full"
          onClick={handleButtonClick}
        >
          View Details
        </button>
      );
    } else if (contest.status === "COMPLETED") {
      return (
        <button
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-md px-4 py-2 w-full"
          onClick={handleButtonClick}
        >
          View Results
        </button>
      );
    } else {
      return (
        <button
          className="bg-gray-700 text-white rounded-md opacity-50 cursor-not-allowed px-4 py-2 w-full"
          disabled
        >
          Coming Soon
        </button>
      );
    }
  };

  return (
    <div
      className="bg-zinc-900 rounded-lg p-6 cursor-pointer hover:bg-zinc-800 transition duration-200"
      onClick={() => navigate(`/contests/${contest.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {contest.title}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs ${getStatusColor()}`}>
              {contest.status}
            </span>
            <span className="flex items-center text-xs text-gray-400">
              {contest.public ? (
                <>
                  <GlobeAltIcon className="w-4 h-4 mr-1" />
                  Public
                </>
              ) : (
                <>
                  <LockClosedIcon className="w-4 h-4 mr-1" />
                  Private
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {contest.description}
      </p>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Start:</span>
          <span className="text-white">
            {new Date(contest.startTime).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">End:</span>
          <span className="text-white">
            {new Date(contest.endTime).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Participants:</span>
          <span className="text-white">
            {contest.currentParticipants}/{contest.maxParticipants || "∞"}
          </span>
        </div>
      </div>

      <div className="mt-4">{getActionButton()}</div>
    </div>
  );
}
