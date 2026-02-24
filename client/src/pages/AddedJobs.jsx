import { Card, Row, Col, Badge, Form, Dropdown, Pagination, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import NoJobsImg from "../assets/No_Jobs.png";
import toast, { Toaster } from "react-hot-toast";
// IMPORT YOUR SUPABASE CLIENT
import { supabase } from "../supabaseClient"; 

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
  const [appliedJobs, setAppliedJobs] = useState([]); // NEW: Jobs from job_applications_status
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState(todayStr);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // NEW: Track current user

  // Load data once on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login to view your jobs");
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      // Fetch manual job applications
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", user.id) 
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);

      // NEW: Fetch applied jobs from job_applications_status with admin_jobs details
      const { data: appliedData, error: appliedError } = await supabase
        .from("job_applications_status")
        .select(`
          *,
          admin_jobs (
            id,
            company_name,
            role,
            location,
            salary,
            experience,
            apply_link,
            created_at
          )
        `)
        .eq("user_id", user.id)
        .eq("is_applied", true)
        .order("created_at", { ascending: false });

      if (appliedError) throw appliedError;
      setAppliedJobs(appliedData || []);

    } catch (error) {
      toast.error("Error fetching jobs from cloud");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Real-time subscription for job_applications_status changes
  useEffect(() => {
    if (!currentUser) return;

    const applicationsChannel = supabase
      .channel('applied-jobs-realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'job_applications_status',
          filter: `user_id=eq.${currentUser.id}`
        },
        async (payload) => {
          // Reload applied jobs on any change
          const { data: appliedData } = await supabase
            .from("job_applications_status")
            .select(`
              *,
              admin_jobs (
                id,
                company_name,
                role,
                location,
                salary,
                experience,
                apply_link,
                created_at
              )
            `)
            .eq("user_id", currentUser.id)
            .eq("is_applied", true)
            .order("created_at", { ascending: false });

          setAppliedJobs(appliedData || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(applicationsChannel);
    };
  }, [currentUser]);

  // Instant filtering based on state (No loading needed here)
  const filteredManualJobs = jobs.filter((job) => {
    const matchSearch = job.company.toLowerCase().includes(search.toLowerCase());
    const jobEntryDate = job.applieddate || job.appliedDate || job.date;
    const matchDate = jobEntryDate === filterDate;
    return matchSearch && matchDate;
  });

  // NEW: Filter applied jobs
  const filteredAppliedJobs = appliedJobs.filter((item) => {
    const job = item.admin_jobs;
    if (!job) return false;
    
    const matchSearch = job.company_name.toLowerCase().includes(search.toLowerCase());
    const jobEntryDate = item.created_at.split('T')[0]; // Get date from created_at
    const matchDate = jobEntryDate === filterDate;
    return matchSearch && matchDate;
  });

  // NEW: Combine both job lists
  const allFilteredJobs = [
    ...filteredAppliedJobs.map(item => ({
      ...item,
      isFromPlatform: true, // Flag to identify platform jobs
      displayData: item.admin_jobs
     })),
    ...filteredManualJobs.map(job => ({
      ...job,
      isFromPlatform: false,
      displayData: job
    }))
  ];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let dateCardText = filterDate;
  if (filterDate === todayStr) dateCardText = "Today";
  else if (filterDate === yesterdayStr) dateCardText = "Yesterday";

  const countForDate = allFilteredJobs.length;

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = allFilteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(allFilteredJobs.length / jobsPerPage);

  const startPage = Math.floor((currentPage - 1) / maxPagesToShow) * maxPagesToShow + 1;
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  const downloadResume = (job) => {
    try {
      const base64 = job.resume_data || job.resumeData; 
      const fileName = job.resume_name || job.resumeName || `${job.company}_Resume.pdf`;

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
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
    } catch (error) {
      toast.error("Error downloading file");
      console.error(error);
    }
  };

  // NEW: Handle status update for platform jobs
  const handlePlatformStatusUpdate = async (jobItem, newStatus) => {
    const { error } = await supabase
      .from("job_applications_status")
      .update({ status: newStatus })
      .eq("id", jobItem.id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    // Optimistic UI update
    const updated = appliedJobs.map(item => 
      item.id === jobItem.id ? { ...item, status: newStatus } : item
    );
    setAppliedJobs(updated);

    toast.success(`Status updated to ${newStatus}`, {
      style: { borderRadius: "10px", background: "#333", color: "#fff" },
      iconTheme: { primary: NAVBAR_COLOR, secondary: "#fff" },
    });
  };

  const renderJobCard = (jobItem, index) => {
    const isFromPlatform = jobItem.isFromPlatform;
    
    if (isFromPlatform) {
      // Render card for jobs from Recent Jobs page (job_applications_status)
      const job = jobItem.displayData;
      const displayDate = jobItem.created_at.split('T')[0];
      const currentStatus = jobItem.status || "Applied"; // Get status from job_applications_status

      return (
        <Col key={`platform-${jobItem.id}`} xs={12} md={6} lg={4}>
          <Card className="h-100 shadow-sm job-card p-3 platform-job-card">
            {/* NEW: Special Badge for Platform Jobs */}
            <div className="platform-badge-container">
              <Badge 
                bg="primary" 
                className="platform-badge"
                style={{
                  background: 'linear-gradient(135deg, #6c5dff 0%, #5a4ee0 100%)',
                  fontSize: '0.7rem',
                  padding: '4px 10px',
                  fontWeight: '700',
                  letterSpacing: '0.5px'
                }}
              >
                ✓ Applied from Platform
              </Badge>
            </div>

            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <h6 className="fw-bold">{job.company_name}</h6>
                {/* NEW: Status Dropdown with Border Styling */}
                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant={statusColors[currentStatus]} 
                    size="sm"
                    className="status-dropdown-toggle"
                  >
                    {currentStatus}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {Object.keys(statusColors).map((status) => (
                      <Dropdown.Item
                        key={status}
                        onClick={() => handlePlatformStatusUpdate(jobItem, status)}
                      >
                        {status}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <p className="text-muted mb-1">{job.role}</p>
              <hr />
              <p className="mb-1 small"><strong>Experience:</strong> {job.experience || "Fresher"}</p>
              <p className="mb-1 small"><strong>Location:</strong> {job.location || "Not specified"}</p>
              <p className="mb-1 small"><strong>Salary:</strong> {job.salary || "As per norms"}</p>
              <p className="mb-1 small"><strong>Applied Date:</strong> {displayDate}</p>

              <div className="mt-3">
                <a 
                  href={job.apply_link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-sm w-100"
                  style={{
                    background: NAVBAR_COLOR,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    fontWeight: '600',
                    fontSize: '0.85rem'
                  }}
                >
                  View Job Details →
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      );
    } else {
      // Render card for manual job applications (original code)
      const job = jobItem.displayData;
      const resumeName = job.resume_name || job.resumeName || "Not Uploaded";
      const hasResume = job.resume_data || job.resumeData;
      const displayDate = job.applieddate || job.appliedDate || job.date;

      return (
        <Col key={job.id || index} xs={12} md={6} lg={4}>
          <Card className="h-100 shadow-sm job-card p-3">
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <h6 className="fw-bold">{job.company}</h6>
                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant={statusColors[job.status]} 
                    size="sm"
                    className="status-dropdown-toggle"
                  >
                    {job.status}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {Object.keys(statusColors).map((status) => (
                      <Dropdown.Item
                        key={status}
                        onClick={async () => {
                          const { error } = await supabase
                            .from("job_applications")
                            .update({ status: status })
                            .eq("id", job.id);

                          if (error) {
                            toast.error("Failed to update status");
                            return;
                          }

                          const updated = [...jobs];
                          const jobIdx = updated.findIndex((j) => j.id === job.id);
                          if (jobIdx > -1) {
                              updated[jobIdx].status = status;
                              setJobs(updated);
                          }

                          toast.success(`Status updated to ${status}`, {
                            style: { borderRadius: "10px", background: "#333", color: "#fff" },
                            iconTheme: { primary: NAVBAR_COLOR, secondary: "#fff" },
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
                      transition: "0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f4f4f4")}
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
    }
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", position: "relative" }}>
      <Toaster position="top-right" />
      
      {/* HEADER SECTION - RESPONSIVE */}
      <Row className="align-items-center mb-4 gy-3">
        <Col xs={12} sm={8} className="text-center text-sm-start">
          <h4 className="fw-semibold mb-0">Recently Applied Jobs 🎉</h4>
        </Col>
        {/* MODIFIED: Enhanced Today Badge Card */}
        <Col xs={12} sm={4} className="d-flex justify-content-center justify-content-sm-end">
          <Card className="text-center px-4 py-2 today-badge-card">
            <h6 className="mb-1 small text-uppercase fw-bold opacity-75">{dateCardText}</h6>
            <div className="d-flex align-items-center justify-content-center gap-2">
                <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{countForDate}</span>
                <Badge bg="light" text="dark" pill style={{ fontSize: '0.7rem' }}>Applications</Badge>
            </div>
          </Card>
        </Col>
      </Row>

      {/* FILTER SECTION - RESPONSIVE */}
      <Row className="mb-4 gy-3 justify-content-end">
        <Col xs={12} md={4} lg={3}>
          <Form.Control
            placeholder="Search by company Name"
            style={{ borderRadius: "8px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col xs={12} md={3} lg={2}>
          <Form.Control
            type="date"
            style={{ borderRadius: "8px" }}
            value={filterDate}
            max={todayStr}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5" style={{ minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spinner animation="border" style={{ color: NAVBAR_COLOR, width: "3rem", height: "3rem" }} />
        </div>
      ) : allFilteredJobs.length === 0 ? (
        <div className="text-center py-5 d-flex flex-column align-items-center">
          <img src={NoJobsImg} alt="No jobs" style={{ maxWidth: "100%", width: "400px", opacity: 0.8 }} />
          <h5 className="mt-3 text-muted">No applications found for this selection.</h5>
        </div>
      ) : (
        <div className="pb-5">
          <Row className="g-4 mb-5">
            {currentJobs.map((job, idx) => renderJobCard(job, idx))}
          </Row>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5 mb-4 overflow-auto">
              <Pagination>
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} />

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

                <Pagination.Next onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
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
            transition: all 0.2s ease-in-out;
            border: 1px solid #e0e0e0;
            background: white;
          }
          .job-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(17,16,46,0.1) !important;
            border: 1px solid ${NAVBAR_COLOR};
          }
          
          /* Today Badge Card Enhancement */
          .today-badge-card {
             background: linear-gradient(135deg, ${NAVBAR_COLOR} 0%, #2a285c 100%);
             color: #fff;
             border: none;
             border-radius: 15px;
             min-width: 140px;
             box-shadow: 0 4px 15px rgba(17, 16, 46, 0.2);
          }

          /* Status Dropdown Border Styling */
          .status-dropdown-toggle {
             border: 2px solid rgba(255,255,255,0.4) !important;
             border-radius: 8px !important;
             font-weight: 600 !important;
             transition: all 0.2s ease;
             box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .status-dropdown-toggle:hover {
             border: 2px solid rgba(255,255,255,0.8) !important;
             transform: scale(1.02);
          }
          .btn-secondary.status-dropdown-toggle { border-color: #6c757d !important; background: transparent; color: #6c757d; }
          .btn-info.status-dropdown-toggle { border-color: #0dcaf0 !important; background: transparent; color: #0dcaf0; }
          .btn-primary.status-dropdown-toggle { border-color: #0d6efd !important; background: transparent; color: #0d6efd; }
          .btn-warning.status-dropdown-toggle { border-color: #ffc107 !important; background: transparent; color: #856404; }
          .btn-success.status-dropdown-toggle { border-color: #198754 !important; background: transparent; color: #198754; }
          .btn-danger.status-dropdown-toggle { border-color: #dc3545 !important; background: transparent; color: #dc3545; }

          /* Platform Job Card Special Styling */
          .platform-job-card {
            position: relative;
            border: 2px solid #6c5dff;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
          }
          .platform-job-card:hover {
            border: 2px solid #5a4ee0;
            box-shadow: 0 12px 30px rgba(108, 93, 255, 0.2) !important;
          }
          
          .platform-badge-container {
            position: absolute;
            top: -12px;
            right: 16px;
            z-index: 10;
          }
          .platform-badge {
            box-shadow: 0 4px 12px rgba(108, 93, 255, 0.3);
            animation: badge-glow 2s ease-in-out infinite;
          }
          @keyframes badge-glow {
            0%, 100% { box-shadow: 0 4px 12px rgba(108, 93, 255, 0.3); }
            50% { box-shadow: 0 6px 16px rgba(108, 93, 255, 0.5); }
          }
          
          .status-badge {
            font-size: 0.75rem;
            padding: 4px 10px;
          }
          
          .page-item.active .page-link {
            background-color: ${NAVBAR_COLOR} !important;
            border-color: ${NAVBAR_COLOR} !important;
            color: white !important;
          }
          .page-link {
            color: ${NAVBAR_COLOR};
            padding: 8px 16px;
            border-radius: 6px;
            margin: 0 2px;
            border: 1px solid #dee2e6;
          }

          @media (max-width: 576px) {
            .today-badge-card {
                padding: 10px 15px !important;
                border-radius: 12px !important;
                margin-top: 10px;
            }
            .pagination {
                font-size: 0.8rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AddedJobs;