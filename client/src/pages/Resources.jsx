import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Spinner } from "react-bootstrap";
import { Book, ExternalLink, Bookmark, Plus, Trash2, Award, Search, Youtube, Info, Terminal, Code, FileText } from "react-feather";
import toast, { Toaster } from "react-hot-toast";

const Resources = () => {
  const [myLinks, setMyLinks] = useState([]);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isLoading, setIsLoading] = useState(true); // Added Loading State

  const platforms = [
    {
      name: "LeetCode",
      url: "https://leetcode.com",
      desc: "Master Data Structures & Algorithms with industry-standard problems.",
      color: "#FFA116",
      stats: "Advanced DSA"
    },
    {
      name: "HackerRank",
      url: "https://hackerrank.com",
      desc: "Focus on language proficiency and certification-style challenges.",
      color: "#2EC866",
      stats: "Skill Kits"
    },
    {
      name: "CodeChef",
      url: "https://codechef.com",
      desc: "Compete in monthly contests and improve your competitive ranking.",
      color: "#5B4638",
      stats: "Global Contests"
    }
  ];

  useEffect(() => {
    // Simulate a brief delay for a smoother "premium" feel
    const timer = setTimeout(() => {
      const saved = JSON.parse(localStorage.getItem("user_resources")) || [];
      setMyLinks(saved);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return toast.error("Please fill all fields");
    const updated = [...myLinks, { ...newLink, id: Date.now() }];
    setMyLinks(updated);
    localStorage.setItem("user_resources", JSON.stringify(updated));
    setNewLink({ title: "", url: "" });
    toast.success("Bookmark saved!");
  };

  const deleteLink = (id) => {
    const updated = myLinks.filter(link => link.id !== id);
    setMyLinks(updated);
    localStorage.setItem("user_resources", JSON.stringify(updated));
    toast.success("Removed");
  };

  const filteredLinks = myLinks.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading Screen Component
  if (isLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100vh", background: "#f8faff" }}>
        <div className="loader-pulse mb-3">
            <Book size={40} className="text-primary" />
        </div>
        <h5 className="fw-bold text-dark" style={{ letterSpacing: '1px' }}>PREPARING HUB...</h5>
        <Spinner animation="border" variant="primary" size="sm" className="mt-2 opacity-50" />
        <style>{`
            .loader-pulse {
                animation: pulse-animation 1.5s infinite ease-in-out;
            }
            @keyframes pulse-animation {
                0% { transform: scale(0.95); opacity: 0.5; }
                50% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(0.95); opacity: 0.5; }
            }
        `}</style>
      </div>
    );
  }

  return (
    <Container fluid className="py-4 px-lg-5 animate-in" style={{ background: "#f8faff", minHeight: "100vh", position: 'relative' }}>
      <Toaster position="bottom-right" />
      
      {/* ACTION TOOLS: Compilers & Resume Checker */}
      <div className="d-none d-md-flex gap-2 position-absolute top-0 end-0 mt-4 me-lg-5">
        <Button 
          href="https://nodeflair.com/resume-checker" 
          target="_blank"
          variant="white"
          className="shadow-sm border-0 rounded-pill px-3 py-2 d-flex align-items-center gap-2 compiler-btn"
          style={{ fontSize: '13px', fontWeight: '700', color: '#ff4757', border: '1px solid #ff475722' }}
        >
          <FileText size={16} /> Check Resume Score
        </Button>
        <Button 
          href="https://www.programiz.com/python-programming/online-compiler/" 
          target="_blank"
          variant="white"
          className="shadow-sm border-0 rounded-pill px-3 py-2 d-flex align-items-center gap-2 compiler-btn"
          style={{ fontSize: '13px', fontWeight: '600', color: '#3b51a3' }}
        >
          <Terminal size={16} /> Programiz
        </Button>
        <Button 
          href="https://www.onlinegdb.com/online_python_compiler" 
          target="_blank"
          variant="white"
          className="shadow-sm border-0 rounded-pill px-3 py-2 d-flex align-items-center gap-2 compiler-btn"
          style={{ fontSize: '13px', fontWeight: '600', color: '#2b8a3e' }}
        >
          <Code size={16} /> OnlineGDB
        </Button>
      </div>

      {/* Header */}
      <div className="mb-5">
        <h2 className="fw-bold d-flex align-items-center gap-3" style={{ color: "#11102e" }}>
          <div></div>
          Coding Hub
        </h2>
        <p className="text-muted ms-3">Direct access to the world's best practice platforms.</p>
      </div>

      <Row className="g-4">
        {/* Main Platforms Section */}
        <Col lg={8}>
          <Row className="g-4">
            {platforms.map((p, idx) => (
              <Col xs={12} key={idx}>
                <Card className="border-0 shadow-sm platform-card overflow-hidden" style={{ borderRadius: "24px" }}>
                  <Card.Body className="p-4 d-md-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-4">
                      <div className="platform-icon" style={{ backgroundColor: p.color }}>
                        <Award size={32} color="white" />
                      </div>
                      <div>
                        <Badge bg="light" className="text-dark mb-2 border">{p.stats}</Badge>
                        <h4 className="fw-bold mb-1">{p.name}</h4>
                        <p className="text-muted mb-0 small" style={{ maxWidth: "400px" }}>{p.desc}</p>
                      </div>
                    </div>
                    <Button 
                      href={p.url} 
                      target="_blank" 
                      className="mt-3 mt-md-0 rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2"
                      style={{ backgroundColor: p.color, border: "none" }}
                    >
                      Start Practice <ExternalLink size={16} />
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Sidebar Bookmarks */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm p-4 sticky-top" style={{ borderRadius: "24px", top: "20px" }}>
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-dark">
              <Bookmark className="text-primary" size={20} /> My Library
            </h5>
            
            <div className="p-3 rounded-4 mb-3" style={{ backgroundColor: "#fcfcff", border: "1px solid #edf0ff" }}>
              <Form onSubmit={handleAddLink}>
                <Form.Group className="mb-2">
                  <Form.Control 
                    type="text" 
                    placeholder="Resource Name" 
                    className="custom-input shadow-none"
                    value={newLink.title}
                    onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                  />
                </Form.Group>
                <InputGroup>
                  <Form.Control 
                    type="text" 
                    placeholder="Paste Link..." 
                    className="custom-input shadow-none border-end-0"
                    value={newLink.url}
                    onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  />
                  <Button variant="primary" type="submit" className="px-3 border-0 d-flex align-items-center" style={{ backgroundColor: "#11102e", borderRadius: "0 10px 10px 0" }}>
                    <Plus size={18} />
                  </Button>
                </InputGroup>
              </Form>
            </div>

            <div className="mb-4 p-2 px-3 rounded-3 border-0 d-flex align-items-center gap-2" style={{ background: "#fff5f5", borderLeft: "3px solid #ff0000 !important" }}>
              <Youtube size={14} color="#ff0000" />
              <span className="text-muted" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                Found a great <b>YouTube tutorial</b> or <b>Doc</b>? Paste it above to save it!
              </span>
            </div>

            <div className="mb-3">
              <InputGroup size="sm" className="bg-light rounded-pill px-2 border align-items-center">
                <Search size={14} className="text-muted ms-2" />
                <Form.Control 
                  placeholder="Search your links..." 
                  className="bg-transparent border-0 shadow-none py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: "13px" }}
                />
              </InputGroup>
            </div>

            <div className="link-scroll">
              {filteredLinks.map(link => (
                <div key={link.id} className="d-flex align-items-center justify-content-between p-3 mb-2 rounded-3 bg-white border border-light link-item shadow-xs">
                  <div className="text-truncate">
                    <div className="fw-bold small">{link.title}</div>
                    <a href={link.url} target="_blank" rel="noreferrer" className="text-muted small text-decoration-none text-truncate d-block" style={{ fontSize: '11px' }}>
                      {link.url}
                    </a>
                  </div>
                  <div className="d-flex gap-1">
                    <Button variant="link" className="p-1 text-danger opacity-50 hover-danger" onClick={() => deleteLink(link.id)}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredLinks.length === 0 && (
                <div className="text-center py-4">
                  <Info size={24} className="text-muted opacity-25 mb-2" />
                  <p className="text-muted small">No links found</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <style>
        {`
          .animate-in {
            animation: fadeIn 0.6s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .compiler-btn {
            background: white !important;
            transition: all 0.2s ease;
          }
          .compiler-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          }
          .platform-card {
            transition: all 0.3s ease;
            border-left: 0px solid transparent !important;
          }
          .platform-card:hover {
            transform: translateY(-5px);
            border-left: 8px solid #11102e !important;
            box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important;
          }
          .platform-icon {
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 18px;
            flex-shrink: 0;
            box-shadow: 0 8px 15px rgba(0,0,0,0.1);
          }
          .custom-input {
            border-radius: 10px !important;
            border: 1px solid #e2e8f0;
            padding: 10px 14px;
            font-size: 14px;
            background-color: #fff;
          }
          .custom-input:focus {
            border-color: #11102e;
            background-color: #fff;
          }
          .link-item {
            transition: background 0.2s;
          }
          .link-item:hover {
            background-color: #f8f9ff !important;
          }
          .hover-danger:hover {
            opacity: 1 !important;
            background-color: #fff5f5;
            border-radius: 6px;
          }
          .link-scroll {
            max-height: 380px;
            overflow-y: auto;
            padding-right: 5px;
          }
          .link-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .link-scroll::-webkit-scrollbar-thumb {
            background: #e0e0e0;
            border-radius: 10px;
          }
        `}
      </style>
    </Container>
  );
};

export default Resources;