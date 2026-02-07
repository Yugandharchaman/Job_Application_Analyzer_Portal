import { useState, useEffect, useRef } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import Confetti from "react-confetti"; 
import { useWindowSize } from "react-use"; 
// --- SUPABASE IMPORT ---
import { supabase } from "../supabaseClient"; // Adjust path if needed

const NAVBAR_COLOR = "#11102e";

const JobForm = () => {
  const today = new Date().toISOString().split("T")[0];
  const { width, height } = useWindowSize(); 
  const fileInputRef = useRef(null); 

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false); 

  const [formData, setFormData] = useState({
    company: "",
    platform: "",
    role: "",
    location: "",
    salary: "",
    bond: "",
    status: "",
    appliedDate: today,
    resumeName: "",
    resumeData: "", 
  });

  useEffect(() => {
    const loadUserResume = async () => {
      // Create a promise that resolves after 1.5 seconds to force a loading state
      const delay = new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        const [{ data: { user } }] = await Promise.all([
          supabase.auth.getUser(),
          delay
        ]);

        if (user) {
          // Create a unique key for THIS user
          const userResumeKey = `resume_${user.id}`;
          const savedResume = JSON.parse(localStorage.getItem(userResumeKey));
          
          if (savedResume) {
            setFormData((prev) => ({
              ...prev,
              resumeName: savedResume.name,
              resumeData: savedResume.data,
            }));
          }
        }
      } catch (error) {
        console.error("Error during load:", error);
      } finally {
        setPageLoading(false);
      }
    };

    loadUserResume();
  }, []);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const resumeObj = { name: file.name, data: reader.result };
          // Save using a key unique to this user
          localStorage.setItem(`resume_${user.id}`, JSON.stringify(resumeObj));

          setFormData({
            ...formData,
            resumeName: file.name,
            resumeData: reader.result, 
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // --- UPDATED SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login to save applications");
        setIsSubmitting(false);
        return;
      }

      // 2. Insert into Supabase
      const { error } = await supabase
  .from("job_applications")
  .insert([
    {
      user_id: user.id,
      company: formData.company,
      platform: formData.platform,
      role: formData.role,
      location: formData.location,
      salary: formData.salary,
      bond: formData.bond,
      status: formData.status,
      applieddate: formData.appliedDate, // Matches your screenshot's lowercase 'applieddate'
      resume_name: formData.resumeName,
      resume_data: formData.resumeData,
    },
  ]);

      if (error) throw error;

      // --- SUCCESS ACTIONS (Kept identical to your code) ---
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      setFormData({
        company: "",
        platform: "",
        role: "",
        location: "",
        salary: "",
        bond: "",
        status: "",
        appliedDate: today,
        resumeName: formData.resumeName, 
        resumeData: formData.resumeData, 
      });

      toast.success("Job Application Saved✨", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
        iconTheme: { primary: "#00d28a", secondary: "#fff" },
      });

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <Spinner animation="grow" style={{ color: NAVBAR_COLOR }} />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={400}
          gravity={0.15}
          recycle={false}
        />
      )}

      <div className="container-fluid py-4" style={{ backgroundColor: "#f8faff", minHeight: "100vh" }}>
        <Row className="justify-content-center">
          <Col lg={10} xl={9}>
            
            <div className="mb-4 text-start">
              <h2 className="fw-bold" style={{ color: NAVBAR_COLOR, letterSpacing: "-1px" }}>
                Applications Hub 🚀
              </h2>
              <p className="text-muted">Stay organized, stay ahead. Log your journey to your dream career.</p>
            </div>

            <Card
              className="border-0 shadow-lg"
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                background: "#fff",
                position: "relative"
              }}
            >
              {isSubmitting && (
                <div style={styles.overlay}>
                  <div className="text-center">
                    <Spinner animation="border" style={{ color: NAVBAR_COLOR, width: '3rem', height: '3rem' }} />
                    <h5 className="mt-3 fw-bold" style={{ color: NAVBAR_COLOR }}>Securing your data...</h5>
                  </div>
                </div>
              )}

              <Row className="g-0">
                {/* Left Side Info Panel */}
                <Col md={4} className="d-none d-md-flex align-items-center justify-content-center p-5" style={{ background: `linear-gradient(135deg, ${NAVBAR_COLOR} 0%, #1c1a4a 100%)` }}>
                  <div className="text-white text-center">
                    <div className="mb-4 display-4">📋</div>
                    <h3 className="fw-bold">Fast Track</h3>
                    <p className="opacity-75 small">Fill in the details once, track your progress forever.</p>
                    <hr className="my-4 opacity-25" />
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <span className="badge rounded-pill bg-success">Resume Auto-Saved</span>
                    </div>
                  </div>
                </Col>

                {/* Right Side Form Panel */}
                <Col md={8}>
                  <Card.Body className="p-4 p-md-5">
                    <Form onSubmit={handleSubmit}>
                      <Row className="g-4">
                        <Col md={6}>
                          <Form.Label className="small fw-bold text-uppercase text-muted">Company Name <span style={{ color: "red" }}>*</span></Form.Label>
                          <InputGroup>
                            <InputGroup.Text className="bg-light border-0">🏢</InputGroup.Text>
                            <Form.Control
                              className="bg-light border-0 shadow-none py-2"
                              name="company"
                              placeholder="e.g  Amazon, Google...."
                              value={formData.company}
                              onChange={handleChange}
                              required
                              disabled={isSubmitting}
                            />
                          </InputGroup>
                        </Col>

                        <Col md={6}>
                          <Form.Label className="small fw-bold text-uppercase text-muted">Applied Via</Form.Label>
                          <Form.Select
                            className="bg-light border-0 shadow-none py-2"
                            name="platform"
                            value={formData.platform}
                            onChange={handleChange}
                            disabled={isSubmitting}
                          >
                            <option value="">Select Platform</option>
                            <option>Company website</option>
                            <option>via Institute</option>
                            <option>WhatsApp Links</option>
                            <option>LinkedIn</option>
                            <option>Naukri</option>
                            <option>Indeed</option>
                            <option>Internshala</option>
                            <option>Wellfound</option>
                            <option>Instahyre</option>
                            <option>Foundit</option>
                            <option>Unstop</option>
                            <option>Superset</option>
                            <option>Glassdoor</option>
                            <option>Kaushalam</option>
                            <option>Referral</option>
                            <option>On-Campus</option>
                            <option>Other</option>
                          </Form.Select>
                        </Col>

                        <Col md={6}>
                          <Form.Label className="small fw-bold text-uppercase text-muted">Role</Form.Label>
                          <Form.Select
                            className="bg-light border-0 shadow-none py-2"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                          
                            disabled={isSubmitting}
                          >
                            <option value="">Select Role</option>
                            <option>Frontend Developer</option>
                            <option>Backend Developer</option>
                            <option>DevOps Engineer</option>
                            <option>Technical Lead</option>
                            <option>Cloud Engineer</option>
                            <option>Data Engineer</option>
                            <option>Testing</option>
                            <option>Business Analyst</option>
                            <option>IT Consultant</option>
                            <option>Network Engineer</option>
                            <option>Database Administrator</option>
                            <option>Java Developer </option>
                            <option>Data Analyst</option>
                            <option>Full Stack Developer</option>
                            <option>Cybersecurity Analyst</option>
                            <option>Systems Administrator</option>
                            <option>Data Scientist</option>
                            <option>AI Engineer</option>
                            <option>Product Manager</option>
                            <option>UI/UX Designer</option>
                            <option>Quality Assurance Engineer</option>
                            <option>Mobile App Developer</option>
                            <option>React Developer</option>
                            <option>Machine Learning Engineer</option>
                            <option>Python Developer</option>
                            <option>Software Engineer</option>
                            <option>Intern</option>
                            <option>Other</option>
                          </Form.Select>
                        </Col>

                        <Col md={6}>
                          <Form.Label className="small fw-bold text-uppercase text-muted">Location</Form.Label>
                          <Form.Select
                            className="bg-light border-0 shadow-none py-2"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            disabled={isSubmitting}
                          >
                            <option value="">Select Location</option>
                            <option>Remote</option>
                            <option>Hybrid</option>
                            <option>PAN India</option>
                            <option>Bangalore</option>
                            <option>Hyderabad</option>
                            <option>Pune</option>
                            <option>Mumbai</option>
                            <option>Chennai</option> 
                            <option>Vizag</option>
                            <option>Delhi</option>
                            <option>Gurgaon</option>
                            <option>Noida</option>
                            <option>Kolkata</option>
                            <option>Other</option>
                          </Form.Select>
                        </Col>

                        <Col md={4}>
                          <Form.Label className="small fw-bold text-uppercase text-muted">Salary (LPA) <span style={{ color: "red" }}>*</span></Form.Label>
                          <InputGroup>
                             <InputGroup.Text className="bg-light border-0">💰</InputGroup.Text>
                             <Form.Control
                                className="bg-light border-0 shadow-none py-2"
                                name="salary"
                                placeholder="e.g. 12"
                                value={formData.salary}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                              />
                          </InputGroup>
                        </Col>

                        <Col md={4}>
                          <Form.Label className="small fw-bold text-uppercase text-muted">Service Bond</Form.Label>
                          <Form.Select
                            className="bg-light border-0 shadow-none py-2"
                            name="bond"
                            value={formData.bond}
                            onChange={handleChange}
                            disabled={isSubmitting}
                          >
                            <option value="">None</option>
                            {[0, 1, 2, 3, 4, 5].map((y) => (
                              <option key={y}>{y} Year</option>
                            ))}
                          </Form.Select>
                        </Col>

                        <Col md={4}>
                          <Form.Label className="small fw-bold text-uppercase text-muted">Applied Date <span style={{ color: "red" }}>*</span></Form.Label>
                          <Form.Control
                            className="bg-light border-0 shadow-none py-2 custom-date"
                            type="date"
                            name="appliedDate"
                            value={formData.appliedDate}
                            onChange={handleChange}
                            max={today}
                            required
                            disabled={isSubmitting}
                          />
                        </Col>

                        <Col md={12}>
                          <Form.Label className="small fw-bold text-uppercase text-muted">Application Status <span style={{ color: "red" }}>*</span></Form.Label>
                          <Form.Select
                            className="bg-light border-0 shadow-none py-2 fw-bold"
                            style={{ color: NAVBAR_COLOR }}
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                          >
                            <option value="">Select Status</option>
                            <option>Applied</option>
                            <option>Selected Screening Round</option>
                            <option>Test</option>
                            <option>TR Round</option>
                            <option>HR Round</option>
                            <option>Offer</option>
                            <option>Rejected</option>
                            <option>Other</option>
                          </Form.Select>
                        </Col>

                        <Col md={12}>
                          <div 
                            className="p-4 border-2 border-dashed rounded-4 text-center mt-2 position-relative"
                            style={{ 
                                borderColor: "#e0e6ed", 
                                backgroundColor: "#fcfdfe",
                                transition: "all 0.3s ease",
                                cursor: "pointer"
                            }}
                            onClick={() => fileInputRef.current.click()}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = NAVBAR_COLOR}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = "#e0e6ed"}
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              name="resume"
                              accept=".pdf,.doc,.docx"
                              onChange={handleChange}
                              required={!formData.resumeData}
                              style={{ display: "none" }}
                            />
                            <div className="mb-2" style={{ fontSize: "2rem" }}>📄</div>
                            <h6 className="mb-1 fw-bold">Upload Resume</h6>
                            <p className="small text-muted mb-0">
                                {formData.resumeName ? (
                                    <span className="text-success fw-bold">✓ Selected: {formData.resumeName}</span>
                                ) : "Click or Drag & Drop your PDF/DOCX here"}
                            </p>
                            {formData.resumeName && (
                                <div className="mt-1 small text-primary opacity-75">Saved for next application!</div>
                            )}
                          </div>
                        </Col>
                      </Row>

                      <div className="text-end mt-5">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="shadow-sm hover-up"
                          style={{
                            backgroundColor: NAVBAR_COLOR,
                            border: "none",
                            padding: "14px 40px",
                            borderRadius: "14px",
                            fontSize: "16px",
                            fontWeight: "600",
                            transition: "all 0.3s ease"
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                              Saving...
                            </>
                          ) : (
                            "Save Application ✨"
                          )}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      <style>
        {`
          .custom-date::-webkit-calendar-picker-indicator {
            cursor: pointer;
            filter: invert(0.2);
          }
          .hover-up:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(17,16,46,0.15) !important;
            filter: brightness(1.1);
          }
          .form-select, .form-control {
            border: 2px solid transparent !important;
          }
          .form-select:focus, .form-control:focus {
            background-color: #fff !important;
            border-color: ${NAVBAR_COLOR} !important;
            box-shadow: none !important;
          }
          .border-dashed {
            border-style: dashed !important;
          }
        `}
      </style>
    </>
  );
};

const styles = {
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    zIndex: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(6px)"
  }
};

export default JobForm;