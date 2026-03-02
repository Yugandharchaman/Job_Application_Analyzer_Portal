import React, { useState } from 'react';

const DailyNews = () => {
  const [newsItems, setNewsItems] = useState([
    {
      id: 1,
      title: "Latest React Hooks Best Practices",
      description: "Exploring efficient state management for complex UI components.",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400&h=250&auto=format&fit=crop",
      tag: "Tech"
    },
    {
      id: 2,
      title: "Upcoming Campus Placement Drive",
      description: "Top MNCs visiting for software engineering roles next month.",
      image: "https://images.unsplash.com/photo-1523050854058-8df9011049f1?q=80&w=400&h=250&auto=format&fit=crop",
      tag: "Student"
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTag, setNewTag] = useState('Tech');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = () => {
    if (!newTitle || !selectedImage) return;

    const newItem = {
      id: Date.now(),
      title: newTitle,
      description: newDesc,
      image: selectedImage,
      tag: newTag
    };

    setNewsItems([newItem, ...newsItems]);
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setSelectedImage(null);
  };

  // --- STYLES ---
  const styles = {
    container: { padding: '40px 20px', fontFamily: "'Inter', sans-serif", color: '#1a1a1a', backgroundColor: '#f6f7fb', minHeight: '100vh' },
    header: { textAlign: 'center', marginBottom: '40px' },
    title: { fontSize: '2.5rem', fontWeight: '800', color: '#020204', margin: '0 0 10px 0' },
    subtitle: { color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' },
    
    uploadPanel: {
      background: 'white',
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      maxWidth: '600px',
      margin: '0 auto 40px auto',
      border: '1px solid #eee'
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      boxSizing: 'border-box' // Crucial for padding
    },
    textArea: {
      width: '100%',
      padding: '12px',
      marginBottom: '15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      height: '80px',
      resize: 'none',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px',
      marginBottom: '15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      backgroundColor: 'white'
    },
    imagePreview: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '8px',
      marginBottom: '15px',
      border: '1px solid #eee'
    },
    uploadButton: {
      padding: '12px 30px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '1rem',
      width: '100%'
    },
    
    // News Grid Styles
    newsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '25px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    newsCard: {
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      transition: 'transform 0.3s ease',
      display: 'flex',
      flexDirection: 'column'
    },
    cardImage: { width: '100%', height: '200px', objectFit: 'cover' },
    cardContent: { padding: '20px' },
    tagBadge: {
      display: 'inline-block',
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginBottom: '10px',
      backgroundColor: '#e1f5fe',
      color: '#0277bd'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Daily News Feed</h2>
        <p style={styles.subtitle}>Upload and explore the latest tech updates and student opportunities.</p>
      </div>

      {/* Upload Form */}
      <div style={styles.uploadPanel}>
        <h3 style={{marginTop: 0, marginBottom: '20px'}}>Add New Item</h3>
        {selectedImage && <img src={selectedImage} alt="Preview" style={styles.imagePreview} />}
        <input type="file" accept="image/*" onChange={handleImageChange} style={{...styles.input, border: 'none', padding: '0'}} />
        <input 
          type="text" 
          placeholder="Title" 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
          style={styles.input} 
        />
        <textarea 
          placeholder="Description" 
          value={newDesc} 
          onChange={(e) => setNewDesc(e.target.value)} 
          style={styles.textArea} 
        />
        <select value={newTag} onChange={(e) => setNewTag(e.target.value)} style={styles.select}>
          <option value="Tech">Tech Field</option>
          <option value="Student">Student Info</option>
        </select>
        <button onClick={handleUpload} style={styles.uploadButton}>Post News</button>
      </div>

      {/* News Grid */}
      <div style={styles.newsGrid}>
        {newsItems.map(item => (
          <div key={item.id} style={styles.newsCard}>
            <img src={item.image} alt={item.title} style={styles.cardImage} />
            <div style={styles.cardContent}>
              <span style={{...styles.tagBadge, backgroundColor: item.tag === 'Tech' ? '#e8f5e9' : '#fff3e0', color: item.tag === 'Tech' ? '#2e7d32' : '#ef6c00'}}>
                {item.tag}
              </span>
              <h4 style={{margin: '0 0 10px 0', fontSize: '1.2rem'}}>{item.title}</h4>
              <p style={{margin: 0, color: '#666', fontSize: '0.95rem', lineHeight: '1.5'}}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyNews;