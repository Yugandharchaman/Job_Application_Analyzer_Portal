import React from "react";
import { Card, Spinner, Badge, Button} from "react-bootstrap";
import { motion } from "framer-motion"; // For smooth, professional animations
import { Cpu,Layers } from "react-feather"; // High-quality icons

const NAVBAR_COLOR = "#11102e";

const JobForm = () => {
  // Animation Variants for a premium feel
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div
      className="container-fluid d-flex align-items-center justify-content-center"
      style={{ 
        minHeight: "90vh", 
        backgroundColor: "#f4f7fe",
        background: "radial-gradient(circle at top right, #eef2ff, #f8faff)" // Subtle gradient depth
      }}
    >
      <style>{`
        .glass-card {
          border: 1px solid rgba(255, 255, 255, 0.8) !important;
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(10px);
          border-radius: 32px !important;
        }
        .coming-soon-badge {
          font-size: 10px;
          letter-spacing: 1.5px;
          padding: 6px 15px;
          border-radius: 8px;
          background: rgba(17, 16, 46, 0.05);
          color: #11102e;
          font-weight: 800;
        }
        .tech-pill {
          padding: 8px 16px !important;
          font-weight: 500 !important;
          border-radius: 12px !important;
          background-color: #ffffff !important;
          color: #475569 !important;
          border: 1px solid #e2e8f0 !important;
          transition: all 0.3s ease;
        }
        .tech-pill:hover {
          border-color: #6366F1 !important;
          color: #6366F1 !important;
          transform: translateY(-2px);
        }
        .pulsing-icon {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: "100%", maxWidth: "560px" }}
      >
        <Card className="glass-card shadow-lg text-center p-5">
          <div className="d-flex justify-content-center mb-3">
            <span className="coming-soon-badge text-uppercase">Coming Soon</span>
          </div>

          <motion.div variants={itemVariants} className="mb-4">
            <div 
              className="mx-auto pulsing-icon d-flex align-items-center justify-content-center"
              style={{ 
                height: "90px", 
                width: "90px", 
                backgroundColor: "#eef2ff", 
                borderRadius: "24px",
                color: NAVBAR_COLOR
              }}
            >
              <Cpu size={48} />
            </div>
          </motion.div>

          <h2 className="fw-extrabold mb-3" style={{ color: NAVBAR_COLOR, fontSize: "2.2rem", letterSpacing: "-1px" }}>
            Mastery Vault 📚
          </h2>

          <p className="text-secondary px-3" style={{ lineHeight: "1.6", fontSize: "1.05rem" }}>
            We are curating a <b>gold-standard collection</b> of the most repeated 
            technical and HR questions to help you land your dream role.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-2 my-4 px-2">
            {["HTML5", "CSS3", "JavaScript", "React", "Python", "SQL", "MongoDB", "Bootstrap", "HR Prep"].map((tech) => (
              <Badge key={tech} className="tech-pill shadow-sm">
                {tech}
              </Badge>
            ))}
          </div>

          <div className="d-flex align-items-center justify-content-center gap-3 my-4">
            <Spinner 
                animation="grow" 
                size="sm" 
                style={{ color: NAVBAR_COLOR, opacity: 0.4 }} 
            />
            <span className="small fw-bold text-uppercase text-muted tracking-widest" style={{ fontSize: '12px' }}>
                Industry review in progress
            </span>
            <Spinner 
                animation="grow" 
                size="sm" 
                style={{ color: NAVBAR_COLOR, opacity: 0.4 }} 
            />
          </div>

          <Button
            disabled
            className="w-100 py-3 fw-bold shadow-sm"
            style={{
              backgroundColor: NAVBAR_COLOR,
              border: "none",
              borderRadius: "18px",
              fontSize: "1.1rem",
              opacity: "0.9"
            }}
          >
            Launching Very Soon 🚀
          </Button>

          <p className="small text-muted mt-4 mb-0 opacity-75">
            <Layers size={14} className="me-1"/> Personalized Progress Tracking included.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default JobForm;