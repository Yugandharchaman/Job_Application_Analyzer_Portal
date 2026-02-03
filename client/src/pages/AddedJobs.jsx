import { Card, Row, Col, Badge, Form, Dropdown, Pagination, Spinner } from "react-bootstrap"; 
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import NoJobsImg from "../assets/No_Jobs.png";
import toast, { Toaster } from "react-hot-toast"; 

const STORAGE_KEY = "job_applications";
const NAVBAR_COLOR = "#11102e";
const jobsPerPage = 6;
const maxPagesToShow = 4;

const statusColors = {
  Applied: "secondary",
  "Selected Screening Round": "info",
  Test: "primary",
  "TR Round": "warning",
  "HR Round": "success",
  Offer: "success",
  Rejected: "danger",
};

const AddedJobs = () => {
  const todayStr = new Date().toISOString().split("T")[0];

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState(todayStr);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); 
    return () => clearTimeout(timer);
  }, [filterDate]);

  const loadData = () => {
    const storedJobs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setJobs([...storedJobs].reverse());
    setLoading(false);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchSearch = job.company.toLowerCase().includes(search.toLowerCase());
    // Updated to check both potential date keys
    const jobEntryDate = job.appliedDate || job.date; 
    const matchDate = jobEntryDate === filterDate;
    return matchSearch && matchDate;
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let dateCardText = filterDate;
  if (filterDate === todayStr) dateCardText = "Today";
  else if (filterDate === yesterdayStr) dateCardText = "Yesterday";

  const countForDate = filteredJobs.length;

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const startPage = Math.floor((currentPage - 1) / maxPagesToShow) * maxPagesToShow + 1;
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  const downloadResume = (job) => {
    try {
        const base64 = job.resumeData;
        const fileName = job.resumeName || `${job.company}_Resume.pdf`;

        if (!base64) {
            toast.error("No resume file found for this application");
            return;
        }

        const link = document.createElement("a");
        link.href = base64;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Downloading Resume...", {
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
        });
    } catch (error) {
        toast.error("Error downloading file");
        console.error(error);
    }
  };

  const renderJobCard = (job, index) => {
    const resumeName = job.resumeName || "Not Uploaded";
    const hasResume = job.resumeData;
    // Fallback for UI display
    const displayDate = job.appliedDate || job.date;

    return (
      <Col key={index} xs={12} md={6} lg={4}>
        <Card className="h-100 shadow-sm job-card p-3">
          <Card.Body>
            <div className="d-flex justify-content-between mb-2">
              <h6 className="fw-bold">{job.company}</h6>
              <Dropdown align="end">
                <Dropdown.Toggle variant={statusColors[job.status]} size="sm">
                  {job.status}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {Object.keys(statusColors).map((status) => (
                    <Dropdown.Item
                      key={status}
                      onClick={() => {
                        const updated = [...jobs];
                        updated[jobs.indexOf(job)].status = status;
                        setJobs(updated);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify([...updated].reverse()));
                        toast.success(`Status updated to ${status}`, {
                          style: { borderRadius: '10px', background: '#333', color: '#fff' },
                          iconTheme: { primary: NAVBAR_COLOR, secondary: '#fff' },
                        });
                      }}
                    >
                      {status}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <p className="text-muted mb-1">{job.role}</p>
            <hr />
            <p className="mb-1 small"><strong>Platform:</strong> {job.platform}</p>
            <p className="mb-1 small"><strong>Location:</strong> {job.location}</p>
            <p className="mb-1 small"><strong>Salary:</strong> {job.salary} LPA</p>
            <p className="mb-1 small"><strong>Bond:</strong> {job.bond}</p>
            <p className="mb-1 small"><strong>Applied Date:</strong> {displayDate}</p>
            
            <div className="mt-2 d-flex align-items-center justify-content-between">
              <span className="text-truncate text-muted small" style={{ maxWidth: 160, fontSize: "13px" }}>
                <strong>Resume:</strong> {resumeName}
              </span>
              {hasResume && (
                <div 
                    title="Download Resume"
                    style={{ 
                        cursor: "pointer", 
                        backgroundColor: "#f4f4f4", 
                        padding: "8px", 
                        borderRadius: "50%",
                        display: "flex",
                        transition: "0.2s" 
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e0e0e0"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f4f4f4"}
                    onClick={() => downloadResume(job)}
                >
                    <FaDownload size={14} style={{ color: NAVBAR_COLOR }} />
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", position: "relative" }}>
      <Toaster position="top-right" />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-semibold">Recently Applied Jobs 🎉</h4>
        <Card className="text-center px-3 py-2" style={{ backgroundColor: NAVBAR_COLOR, color: "#fff" }}>
          <h6 className="mb-1">{dateCardText}</h6>
          <Badge bg="light" text="dark" pill>{countForDate}</Badge>
        </Card>
      </div>

      <div className="d-flex gap-3 justify-content-end mb-4">
        <Form.Control
          placeholder="Search by company Name"
          style={{ maxWidth: 260 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Form.Control
          type="date"
          style={{ maxWidth: 200 }}
          value={filterDate}
          max={todayStr}
          onChange={(e) => {
            setFilterDate(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className="text-center py-5" style={{ minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spinner animation="border" style={{ color: NAVBAR_COLOR, width: '3rem', height: '3rem' }} />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-5">
          <img src={NoJobsImg} alt="No jobs" style={{ maxWidth: 400 }} />
        </div>
      ) : (
        <div className="pb-5">
          <Row className="g-4 mb-5">{currentJobs.map(renderJobCard)}</Row>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5 mb-4">
              <Pagination>
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                
                {startPage > 1 && (
                  <>
                    <Pagination.Item onClick={() => setCurrentPage(1)}>1</Pagination.Item>
                    <Pagination.Ellipsis disabled />
                  </>
                )}

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Pagination.Item>
                ))}

                {endPage < totalPages && (
                  <>
                    <Pagination.Ellipsis disabled />
                    <Pagination.Item onClick={() => setCurrentPage(totalPages)}>{totalPages}</Pagination.Item>
                  </>
                )}

                <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </div>
      )}

      <style>
        {`
          .job-card {
            border-radius: 12px;
            transition: all 0.3s ease;
            border: 1px solid #e0e0e0;
          }
          .job-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 14px 35px rgba(17,16,46,0.25);
            border: 2px solid ${NAVBAR_COLOR};
          }
          .page-item.active .page-link {
            background-color: ${NAVBAR_COLOR} !important;
            border-color: ${NAVBAR_COLOR} !important;
            color: white !important;
          }
          .page-link {
            color: ${NAVBAR_COLOR};
            padding: 8px 16px;
            border-radius: 4px;
            margin: 0 2px;
          }
        `}
      </style>
    </div>
  );
};

export default AddedJobs;