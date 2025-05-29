import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getContestById, registerContest } from "../api/contestApi";
import { getProblems } from "../api/problemsApi";
import {
  getRegistrations,
  approveRegistration,
  rejectRegistration,
} from "../api/contestRegistrationApi";
import { getLeaderboard } from "../api/leaderboardApi";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import LeaderboardTab from "../components/contest/LeaderboardTab";
import { GlobeAltIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function ContestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { showNotification } = useNotification();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [problems, setProblems] = useState([]);
  const [registerMsg, setRegisterMsg] = useState("");
  const [registering, setRegistering] = useState(false);
  const [tab, setTab] = useState("overview");
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [lastUserRegStatus, setLastUserRegStatus] = useState(null);

  // Debug logs
  useEffect(() => {
    console.log("Auth state in ContestDetails:", { user, token });
  }, [user, token]);

  useEffect(() => {
    getContestById(id, token)
      .then((data) => {
        setContest(data);
        setLoading(false);
        if (data.problemIds && data.problemIds.length > 0) {
          getProblems().then((all) => {
            setProblems(all.filter((p) => data.problemIds.includes(p.id)));
          });
        }
      })
      .catch((error) => {
        console.error("Error loading contest:", error);
        setError("Failed to load contest");
        setLoading(false);
      });
  }, [id, token]);

  // Add tab control based on URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (
      tabParam &&
      ["overview", "problems", "registrations", "leaderboard"].includes(
        tabParam
      )
    ) {
      setTab(tabParam);
    }
  }, []);

  // Function to check for registration status changes
  const checkRegistrationStatusChange = (regs) => {
    if (!user || regs.length === 0) return;

    const userReg = regs.find((r) => r.username === user.username);

    if (userReg && lastUserRegStatus && userReg.status !== lastUserRegStatus) {
      // Status has changed
      if (userReg.status === "APPROVED") {
        showNotification(
          "Your contest registration has been approved!",
          "success"
        );
      } else if (userReg.status === "REJECTED") {
        showNotification(
          "Your contest registration has been rejected.",
          "error"
        );
      }
    }

    // Update last known status
    if (userReg) {
      setLastUserRegStatus(userReg.status);
    }
  };

  const refreshRegistrations = () => {
    // Always fetch registrations for the current user
    if (contest) {
      setRegLoading(true);
      // Use different endpoints based on user role
      const endpoint =
        user?.role === "admin" ||
        (user?.role === "instructor" && contest.createdById === user.id)
          ? getRegistrations(contest.id, token) // Admin/instructor sees all registrations
          : getLeaderboard(contest.id, token); // Regular users see only leaderboard

      endpoint
        .then((data) => {
          setRegistrations(data);
          checkRegistrationStatusChange(data);
          setRegLoading(false);
        })
        .catch(() => {
          setRegError("Failed to load registrations");
          setRegLoading(false);
        });
    }
  };

  useEffect(() => {
    refreshRegistrations();
    // Set up an interval to periodically check for registration status changes
    const intervalId = setInterval(() => {
      if (user && contest) {
        refreshRegistrations();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, [contest, user, token]);

  const handleRegister = async () => {
    if (!token) {
      setRegisterMsg("You must be signed in to register.");
      showNotification("You must be signed in to register", "warning");
      return;
    }
    setRegistering(true);
    setRegisterMsg("");
    try {
      await registerContest(id, token);
      setRegisterMsg("Registration successful! Waiting for approval.");
      showNotification(
        "Registration successful! Waiting for approval.",
        "success"
      );
      refreshRegistrations();
    } catch (e) {
      console.error("Registration error:", e);

      let errorMsg = "";
      if (e.response?.status === 401) {
        errorMsg = "Session expired. Please sign in again.";
      } else if (e.response?.status === 500) {
        errorMsg =
          "Internal Server Error. Please contact admin or try again later.";
      } else if (e.response?.data?.message?.includes("đã đăng ký")) {
        errorMsg = "You have already registered for this contest.";
        refreshRegistrations();
      } else if (e.response?.data?.message?.includes("số lượng")) {
        errorMsg = "This contest has reached maximum number of participants.";
      } else {
        errorMsg = e.response?.data?.message || "Registration failed!";
      }

      setRegisterMsg(errorMsg);
      showNotification(errorMsg, "error");
    }
    setRegistering(false);
  };

  const handleApprove = async (registrationId) => {
    try {
      await approveRegistration(registrationId, token);
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId ? { ...r, status: "APPROVED" } : r
        )
      );

      // Find user info to include in notification
      const regInfo = registrations.find((r) => r.id === registrationId);
      showNotification(
        `Registration for ${regInfo?.username || "user"} approved successfully`,
        "success"
      );

      if (userRegistration?.id === registrationId) {
        setRegisterMsg("Your registration has been approved!");
      }
      getContestById(id, token).then((data) => {
        setContest(data);
      });
    } catch (error) {
      console.error("Error approving registration:", error);
      setRegError("Failed to approve registration");
      showNotification("Failed to approve registration", "error");
    }
  };

  const handleReject = async (registrationId) => {
    try {
      await rejectRegistration(registrationId, token);
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId ? { ...r, status: "REJECTED" } : r
        )
      );

      // Find user info to include in notification
      const regInfo = registrations.find((r) => r.id === registrationId);
      showNotification(
        `Registration for ${regInfo?.username || "user"} rejected`,
        "warning"
      );

      if (userRegistration?.id === registrationId) {
        setRegisterMsg("Your registration has been rejected.");
      }
    } catch (error) {
      console.error("Error rejecting registration:", error);
      setRegError("Failed to reject registration");
      showNotification("Failed to reject registration", "error");
    }
  };

  const userRegistration = registrations.find(
    (r) => r.username === user?.username
  );

  // Update last user registration status when it changes
  useEffect(() => {
    if (userRegistration && userRegistration.status !== lastUserRegStatus) {
      setLastUserRegStatus(userRegistration.status);
    }
  }, [userRegistration, lastUserRegStatus]);

  if (loading)
    return <div className="text-center text-white py-10">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!contest) return null;

  return (
    <div className="bg-black min-h-screen w-full flex flex-col justify-between">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full py-8 px-2 md:px-0">
        <h1 className="text-3xl font-bold text-white mb-2">{contest.title}</h1>
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`px-2 py-1 text-xs font-medium text-white rounded ${
              contest.status === "ONGOING"
                ? "bg-green-600"
                : contest.status === "UPCOMING"
                ? "bg-yellow-600"
                : contest.status === "COMPLETED"
                ? "bg-gray-600"
                : "bg-purple-600"
            }`}
          >
            {contest.status}
          </span>
          {/* Thêm thời gian còn lại nếu cần */}
        </div>
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              tab === "overview"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900 text-gray-400"
            }`}
            onClick={() => setTab("overview")}
          >
            Tổng quan
          </button>
          <button
            className={`px-4 py-2 rounded ${
              tab === "problems"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900 text-gray-400"
            } ${
              // Allow access to problems if contest is public and ongoing, or if user is approved/admin/instructor
              contest.status === "ONGOING" &&
              (contest.public ||
                userRegistration?.status === "APPROVED" ||
                user?.role === "admin" ||
                (user?.role === "instructor" &&
                  contest.createdById === user.id))
                ? ""
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={() => {
              // Allow access to problems if contest is public and ongoing, or if user is approved/admin/instructor
              if (
                contest.status === "ONGOING" &&
                (contest.public ||
                  userRegistration?.status === "APPROVED" ||
                  user?.role === "admin" ||
                  (user?.role === "instructor" &&
                    contest.createdById === user.id))
              ) {
                setTab("problems");
              } else if (contest.status !== "ONGOING") {
                showNotification(
                  "Cuộc thi chưa bắt đầu hoặc đã kết thúc",
                  "warning"
                );
              } else if (!user) {
                showNotification(
                  "Vui lòng đăng nhập để xem bài thi",
                  "warning"
                );
              } else if (!contest.public && !userRegistration) {
                showNotification(
                  "Bạn phải đăng ký cuộc thi này trước",
                  "warning"
                );
              } else if (
                !contest.public &&
                userRegistration.status !== "APPROVED"
              ) {
                showNotification(
                  "Đăng ký của bạn phải được chấp nhận để xem bài thi",
                  "warning"
                );
              }
            }}
          >
            Bài tập
          </button>
          <button
            className={`px-4 py-2 rounded ${
              tab === "leaderboard"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900 text-gray-400"
            }`}
            onClick={() => setTab("leaderboard")}
          >
            Bảng xếp hạng
          </button>
          {(user?.role === "admin" ||
            (user?.role === "instructor" &&
              contest.createdById === user.id)) && (
            <button
              className={`px-4 py-2 rounded ${
                tab === "registrations"
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-900 text-gray-400"
              }`}
              onClick={() => setTab("registrations")}
            >
              Đăng ký
            </button>
          )}
        </div>
        {/* Display access restriction message if needed */}
        {tab === "problems" &&
          contest.status === "ONGOING" &&
          !(
            contest.public || // Allow access if contest is public
            userRegistration?.status === "APPROVED" ||
            user?.role === "admin" ||
            (user?.role === "instructor" && contest.createdById === user.id)
          ) && (
            <div className="bg-red-800 text-white p-4 rounded-md mb-4">
              <h3 className="font-bold mb-2">Access Restricted</h3>
              <p>
                {!user
                  ? "Please sign in to view contest problems."
                  : !userRegistration
                  ? "You must register for this contest to view problems."
                  : userRegistration.status === "PENDING"
                  ? "Your registration is pending approval."
                  : "Your registration has been rejected."}
              </p>
            </div>
          )}

        {tab === "problems" && contest.status !== "ONGOING" && (
          <div className="bg-yellow-800 text-white p-4 rounded-md mb-4">
            <h3 className="font-bold mb-2">Problems Not Available</h3>
            <p>
              {contest.status === "UPCOMING"
                ? "Contest problems will be available when the contest starts."
                : "This contest has ended."}
            </p>
          </div>
        )}

        {tab === "overview" && (
          <>
            {user && userRegistration && !contest.public && (
              <div
                className={`mb-4 px-4 py-2 rounded text-sm font-medium ${
                  userRegistration.status === "APPROVED"
                    ? "bg-green-700 text-white"
                    : userRegistration.status === "REJECTED"
                    ? "bg-red-700 text-white"
                    : "bg-yellow-700 text-white"
                }`}
              >
                {userRegistration.status === "APPROVED" &&
                  "Your registration has been approved! You can join the contest."}
                {userRegistration.status === "REJECTED" &&
                  "Your registration was rejected."}
                {userRegistration.status === "PENDING" &&
                  "Your registration is pending approval."}
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-6">
              <section className="flex-1">
                <div className="bg-zinc-900 rounded-lg p-6 mb-4">
                  <h2 className="text-lg font-bold mb-2">Description</h2>
                  <div className="text-gray-200">{contest.description}</div>
                </div>
                <div className="bg-zinc-900 rounded-lg p-6 mb-4">
                  <h2 className="text-lg font-bold mb-2">Problems</h2>
                  {problems.length > 0 ? (
                    <ul className="space-y-2">
                      {problems.map((p) => (
                        <li key={p.id}>
                          <button
                            className="text-primary-pink hover:underline"
                            onClick={() =>
                              navigate(`/contests/${id}/problems/${p.id}`, {
                                state: { contestTitle: contest.title },
                              })
                            }
                          >
                            {p.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-400">No problems listed.</div>
                  )}
                </div>
              </section>
              <aside className="w-full md:w-80 flex-shrink-0">
                <div className="bg-zinc-900 rounded-lg p-6 mb-4">
                  <h2 className="text-lg font-bold mb-2">Contest Details</h2>
                  <div className="text-gray-300 text-sm mb-2">
                    <div>
                      <b>Time</b>
                    </div>
                    <div>
                      {new Date(contest.startTime).toLocaleString()}
                      <br />
                      to
                      <br />
                      {new Date(contest.endTime).toLocaleString()}
                    </div>
                    <div className="mt-2">
                      <b>Duration</b>
                    </div>
                    <div>
                      {Math.round(
                        (new Date(contest.endTime) -
                          new Date(contest.startTime)) /
                          3600000
                      )}{" "}
                      hours
                    </div>
                    <div className="mt-2">
                      <b>Type</b>
                    </div>
                    <div className="flex items-center">
                      {contest.public ? (
                        <>
                          <GlobeAltIcon className="w-4 h-4 mr-1" />
                          Public Contest
                        </>
                      ) : (
                        <>
                          <LockClosedIcon className="w-4 h-4 mr-1" />
                          Private Contest
                        </>
                      )}
                    </div>
                    <div className="mt-2">
                      <b>Participants</b>
                    </div>
                    <div>
                      {contest.currentParticipants || 0}/
                      {contest.maxParticipants}
                    </div>
                    <div className="mt-2">
                      <b>Problems</b>
                    </div>
                    <div>{contest.problemIds.length} problems</div>
                  </div>
                  {(contest.status === "UPCOMING" ||
                    contest.status === "ONGOING") &&
                    !userRegistration && (
                      <button
                        className="bg-[#722055] hover:bg-[#50153a] text-white font-semibold rounded-full px-4 py-2 w-full"
                        onClick={handleRegister}
                        disabled={registering}
                      >
                        {registering ? "Registering..." : "Register"}
                      </button>
                    )}
                  {userRegistration && (
                    <div
                      className={`mt-2 py-2 px-4 rounded-md text-center text-sm font-medium ${
                        userRegistration.status === "APPROVED"
                          ? "bg-green-700 text-white"
                          : userRegistration.status === "REJECTED"
                          ? "bg-red-700 text-white"
                          : "bg-yellow-600 text-white"
                      }`}
                    >
                      {userRegistration.status === "APPROVED" && (
                        <>
                          Registration Approved
                          {contest.status === "ONGOING" && (
                            <button
                              className="mt-2 bg-[#722055] hover:bg-[#50153a] text-white font-semibold rounded-full px-4 py-2 w-full"
                              onClick={() => setTab("problems")}
                            >
                              View Problems
                            </button>
                          )}
                        </>
                      )}
                      {userRegistration.status === "REJECTED" &&
                        "Registration Rejected"}
                      {userRegistration.status === "PENDING" &&
                        "Registration Pending"}
                    </div>
                  )}
                  {registerMsg && !userRegistration && (
                    <div className="text-center text-sm mt-2 text-pink-400">
                      {registerMsg}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}
        {tab === "problems" && (
          <div className="bg-zinc-900 rounded-lg p-6 mb-4">
            <h2 className="text-lg font-bold mb-2">Problems</h2>
            {problems.length > 0 ? (
              <ul className="space-y-2">
                {problems.map((p) => (
                  <li key={p.id}>
                    <button
                      className="text-primary-pink hover:underline"
                      onClick={() =>
                        navigate(`/contests/${id}/problems/${p.id}`, {
                          state: { contestTitle: contest.title },
                        })
                      }
                    >
                      {p.title}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No problems listed.</div>
            )}
          </div>
        )}
        {tab === "leaderboard" && (
          <LeaderboardTab contestId={id} token={token} />
        )}

        {tab === "registrations" && (
          <div className="bg-zinc-900 rounded-lg p-6 mb-4">
            <h2 className="text-lg font-bold mb-2">Quản lý đăng ký</h2>
            {regLoading ? (
              <div className="text-white">Đang tải...</div>
            ) : regError ? (
              <div className="text-red-500">{regError}</div>
            ) : (
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-400">
                    <th className="py-2 px-2">Tên người dùng</th>
                    <th className="py-2 px-2">Email</th>
                    <th className="py-2 px-2">Trạng thái</th>
                    <th className="py-2 px-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r.id} className="border-b border-zinc-800">
                      <td className="py-2 px-2">{r.username}</td>
                      <td className="py-2 px-2">{r.email}</td>
                      <td className="py-2 px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            r.status === "APPROVED"
                              ? "bg-green-700 text-white"
                              : r.status === "REJECTED"
                              ? "bg-red-700 text-white"
                              : "bg-yellow-700 text-white"
                          }`}
                        >
                          {r.status === "APPROVED"
                            ? "Đã duyệt"
                            : r.status === "REJECTED"
                            ? "Từ chối"
                            : "Chờ duyệt"}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        {r.status === "PENDING" && (
                          <>
                            <button
                              className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                              onClick={() => handleApprove(r.id)}
                            >
                              Duyệt
                            </button>
                            <button
                              className="bg-red-600 text-white px-2 py-1 rounded"
                              onClick={() => handleReject(r.id)}
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        {r.status === "APPROVED" && (
                          <span className="text-green-500">Đã duyệt</span>
                        )}
                        {r.status === "REJECTED" && (
                          <span className="text-red-500">Đã từ chối</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
