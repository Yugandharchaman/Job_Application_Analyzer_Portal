import React, { useState } from 'react';

const AIResumerAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setResult(null);
    }
  };

  const startAnalysis = () => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);

    // --- DEEP ANALYSIS SIMULATION ---
    // In a real app, this is where you call your AI backend (e.g., OpenAI, AWS)
    setTimeout(() => {
      setAnalyzing(false);
      // Realistic simulation based on "deep scanning"
      setResult({
        score: 78,
        match: "Good Match",
        missingKeywords: ["TypeScript", "Docker", "AWS", "CI/CD"],
        tips: [
          "Use the STAR method (Situation, Task, Action, Result) for bullet points.",
          "Limit resume to 1-2 pages.",
          "Ensure bullet points start with strong action verbs."
        ],
        formattingIssues: [
          "Inconsistent font sizes in experience section.",
          "Missing margin consistency."
        ]
      });
    }, 3500); // Slightly longer for "deep" analysis
  };

  // --- STYLES ---
  const styles = {
    container: { 
      padding: '40px 20px', 
      fontFamily: "'Inter', sans-serif", 
      color: '#1a1a1a', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f6f7fb'
    },
    header: { textAlign: 'center', marginBottom: '40px' },
    title: { fontSize: '2.5rem', fontWeight: '800', color: '#020204', margin: '0 0 10px 0' },
    subtitle: { color: '#666', fontSize: '1.1rem', maxWidth: '600px' },
    
    uploadBox: {
      background: 'white',
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      textAlign: 'center',
      width: '100%',
      maxWidth: '500px',
      marginBottom: '30px',
      border: '1px solid #eee'
    },
    hiddenInput: { display: 'none' },
    fileLabel: {
      display: 'block',
      padding: '20px',
      background: '#f8f9fa',
      border: '2px dashed #3498db',
      borderRadius: '12px',
      cursor: 'pointer',
      color: '#3498db',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      marginBottom: '20px'
    },
    analyzeButton: {
      padding: '12px 30px',
      backgroundColor: '#020204',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '1rem',
      transition: 'background 0.3s ease',
      width: '100%'
    },
    disabledButton: { backgroundColor: '#a0a0a0', cursor: 'not-allowed' },
    
    // Scanner Styles
    scannerWrapper: { 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      margin: '20px 0' 
    },
    documentMock: {
      width: '180px',
      height: '240px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      padding: '15px',
      marginBottom: '15px'
    },
    scannerLine: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '4px',
      background: 'linear-gradient(to right, #3498db, #9b59b6, #3498db)',
      boxShadow: '0 0 10px #3498db',
      animation: 'fastScan 1.5s infinite linear',
    },
    // Simple loader spinner
    spinner: {
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 15px auto'
    },

    // Results Styles
    resultSection: {
      background: 'white',
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      width: '100%',
      maxWidth: '700px',
      border: '1px solid #eee',
      animation: 'fadeIn 0.5s ease'
    },
    scoreRow: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' },
    scoreCircle: {
      width: '110px',
      height: '110px',
      borderRadius: '50%',
      border: '8px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#27ae60'
    },
    keywordBadge: {
      display: 'inline-block',
      background: '#e1f5fe',
      color: '#0277bd',
      padding: '6px 12px',
      borderRadius: '20px',
      margin: '5px',
      fontSize: '0.85rem',
      fontWeight: '500'
    },
    panel: {
      background: '#f8f9fa',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '15px'
    }
  };

  // --- KEYFRAMES ---
  const keyframes = `
    @keyframes fastScan {
      0% { top: -10%; }
      100% { top: 110%; }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      
      <div style={styles.header}>
        <h2 style={styles.title}>AI Deep Resume Analyzer</h2>
        <p style={styles.subtitle}>Upload your resume for a comprehensive AI-powered deep scan.</p>
      </div>

      <div style={styles.uploadBox}>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} id="fileInput" style={styles.hiddenInput} />
        <label htmlFor="fileInput" style={styles.fileLabel}>
          {file ? file.name : "Click to upload Resume (PDF/DOC)"}
        </label>
        <button 
          onClick={startAnalysis} 
          disabled={!file || analyzing} 
          style={{...styles.analyzeButton, ...((!file || analyzing) ? styles.disabledButton : {})}}
        >
          {analyzing ? "Deep Scanning..." : "Analyze Resume"}
        </button>
      </div>

      {/* --- ANIMATION AREA --- */}
      {analyzing && (
        <div style={styles.scannerWrapper}>
          <div style={styles.spinner}></div>
          <div style={styles.documentMock}>
            <div style={styles.scannerLine}></div>
            <div style={{...styles.lineMock, height: '10px', background: '#eee', borderRadius: '2px', width: '70%', marginBottom: '10px'}}></div>
            <div style={{...styles.lineMock, height: '8px', background: '#eee', borderRadius: '2px', width: '100%', marginBottom: '8px'}}></div>
            <div style={{...styles.lineMock, height: '8px', background: '#eee', borderRadius: '2px', width: '90%', marginBottom: '8px'}}></div>
            <div style={{...styles.lineMock, height: '8px', background: '#eee', borderRadius: '2px', width: '50%'}}></div>
          </div>
          <p style={{marginTop: '15px', color: '#3498db', fontWeight: 'bold'}}>AI is conducting a deep scan...</p>
        </div>
      )}
      {/* ---------------------- */}

      {result && (
        <div style={styles.resultSection}>
          <div style={styles.scoreRow}>
            <div style={{...styles.scoreCircle, borderColor: result.score > 80 ? '#27ae60' : result.score > 70 ? '#f39c12' : '#e74c3c'}}>
              {result.score}%
            </div>
            <div>
              <h3 style={{margin: '0 0 5px 0'}}>Deep Analysis Results</h3>
              <p style={{margin: 0, fontSize: '1.2rem', color: '#555'}}>
                Overall Match: <strong>{result.match}</strong>
              </p>
            </div>
          </div>

          <div style={styles.panel}>
            <h4 style={{margin: '0 0 10px 0'}}>🚀 Missing Keywords</h4>
            {result.missingKeywords.map(kw => (
              <span key={kw} style={styles.keywordBadge}>{kw}</span>
            ))}
          </div>

          <div style={styles.panel}>
            <h4 style={{margin: '0 0 10px 0'}}>💡 Actionable Resume Tips</h4>
            <ul style={{paddingLeft: '20px', color: '#444', margin: 0}}>
              {result.tips.map((tip, i) => <li key={i} style={{marginBottom: '5px'}}>{tip}</li>)}
            </ul>
          </div>
          
          <div style={styles.panel}>
            <h4 style={{margin: '0 0 10px 0'}}>🎨 Formatting & Structural Checks</h4>
            <ul style={{paddingLeft: '20px', color: '#c0392b', margin: 0}}>
              {result.formattingIssues.map((issue, i) => <li key={i} style={{marginBottom: '5px'}}>{issue}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIResumerAnalyzer;