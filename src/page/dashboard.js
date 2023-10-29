import React, { useState, useEffect } from "react";
import axios from "axios";
import { Auth } from "aws-amplify";
import "./Dashboard.css";

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  useEffect(() => {
    fetchReports();
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    try {
      const userInfo = await Auth.currentAuthenticatedUser();
      setUser(userInfo);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://fxb8z0anl0.execute-api.eu-west-3.amazonaws.com/prod/all-reports"
      );
      setReports(response.data.reports);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setError(error);
      setLoading(false);
    }
  };

  const deleteReport = (reportId) => {
    setIsPopupOpen(true);
    setReportToDelete(reportId);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `https://fxb8z0anl0.execute-api.eu-west-3.amazonaws.com/prod/delete-report/${reportToDelete}`
      );
      console.log("Report deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete the report:", error);
    }
    setIsPopupOpen(false);
  };

  const renderReports = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="5">Loading...</td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="5">Error: {error.message}</td>
        </tr>
      );
    }

    if (!reports || reports.length === 0) {
      return (
        <tr>
          <td colSpan="5">No reports available.</td>
        </tr>
      );
    }

    return reports.map((report) => (
      <tr key={report._id} className={report.deleted ? "deleted-report" : ""}>
        <td>{report.reportedBy?.email}</td>
        <td>{report.userBeingReported?.email}</td>
        <td>{report.reportReason}</td>
        <td>{new Date(report.date).toLocaleDateString()}</td>
        <td>
          {!report.deleted && (
            <button
              className="delete-button"
              onClick={() => deleteReport(report._id)}
            >
              Delete
            </button>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <div className="dashboard-container">
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-inner">
            <h2>Are you sure you want to delete? This will delete the employer account.</h2>
            <button className="delete-button" onClick={confirmDelete}>Delete</button>
            <button className="cancel-button" onClick={() => setIsPopupOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="navbar">
        {user && (
          <div className="user-info">
            Welcome, {user.attributes.email}
            <button className="signout-button" onClick={signOut}>
              Sign Out
            </button>
          </div>
        )}
      </div>
      <h1>Admin Dashboard</h1>
      <button className="fetch-button" onClick={fetchReports}>
        Get Reports
      </button>
      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>Reported By</th>
              <th>Company Reported</th>
              <th>Report Reason</th>
              <th>Date of Report</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{renderReports()}</tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
