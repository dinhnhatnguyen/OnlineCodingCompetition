import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { getRegistrations } from "../../api/contestRegistrationApi";
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

    // For ONGOING contests
    if (contest.status === "ONGOING") {
      // Show different button based on registration status
      if (!user) {
        return (
          <button
            className="bg-gray-700 text-white rounded-md px-4 py-2 w-full"
            onClick={handleButtonClick}
          >
            Sign in to join
          </button>
        );
      } else if (!userRegistration) {
        return (
          <button
            className="bg-gray-700 text-white rounded-md px-4 py-2 w-full"
            onClick={handleButtonClick}
          >
            Not Registered
          </button>
        );
      } else if (userRegistration.status === "APPROVED") {
        return (
          <button
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-md px-4 py-2 w-full"
            onClick={handleButtonClick}
          >
            Join Now
          </button>
        );
      } else if (userRegistration.status === "PENDING") {
        return (
          <button
            className="bg-yellow-600 text-white rounded-md px-4 py-2 w-full"
            onClick={handleButtonClick}
          >
            Pending Approval
          </button>
        );
      } else {
        return (
          <button
            className="bg-red-600 text-white rounded-md px-4 py-2 w-full"
            onClick={handleButtonClick}
          >
            Registration Rejected
          </button>
        );
      }
    } else if (contest.status === "UPCOMING") {
      if (userRegistration) {
        switch (userRegistration.status) {
          case "APPROVED":
            return (
              <button
                className="bg-green-600 text-white rounded-md px-4 py-2 w-full"
                onClick={handleButtonClick}
              >
                Approved
              </button>
            );
          case "REJECTED":
            return (
              <button
                className="bg-red-600 text-white rounded-md px-4 py-2 w-full"
                onClick={handleButtonClick}
              >
                Rejected
              </button>
            );
          case "PENDING":
            return (
              <button
                className="bg-yellow-600 text-white rounded-md px-4 py-2 w-full"
                onClick={handleButtonClick}
              >
                Pending Approval
              </button>
            );
          default:
            return (
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-md px-4 py-2 w-full"
                onClick={handleButtonClick}
              >
                Register
              </button>
            );
        }
      } else {
        return (
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-md px-4 py-2 w-full"
            onClick={handleButtonClick}
          >
            Register
          </button>
        );
      }
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
      className="bg-zinc-900 rounded-lg p-4 shadow-md cursor-pointer hover:ring-2 hover:ring-primary-pink transition"
      onClick={() => navigate(`/contests/${contest.id}`)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{contest.title}</h3>
          <p className="text-gray-400 text-sm mt-1">{contest.description}</p>
          <p className="text-gray-500 text-xs mt-2">
            📅 {new Date(contest.startTime).toLocaleDateString()} -{" "}
            {new Date(contest.endTime).toLocaleDateString()}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {contest.maxParticipants
              ? `👥 ${contest.currentParticipants || 0}/${
                  contest.maxParticipants
                } participants`
              : null}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {contest.problemIds.length} problems
          </p>

          {/* Registration Status Badge */}
          {userRegistration && (
            <p className="text-xs mt-1">
              <span
                className={`inline-block px-2 py-0.5 rounded ${
                  userRegistration.status === "APPROVED"
                    ? "bg-green-700 text-white"
                    : userRegistration.status === "REJECTED"
                    ? "bg-red-700 text-white"
                    : "bg-yellow-600 text-white"
                }`}
              >
                {userRegistration.status}
              </span>
            </p>
          )}
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium text-white rounded ${getStatusColor()}`}
        >
          {contest.status}
        </span>
      </div>
      <div className="mt-4">{getActionButton()}</div>
    </div>
  );
}
