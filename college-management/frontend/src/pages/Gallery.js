import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../api/axios';
import './Gallery.css';

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    API.get('/gallery')
      .then(res => {
        setGallery(res.data.gallery || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['All', 'campus', 'events', 'sports', 'cultural', 'other'];

  const filtered = selectedCategory === 'All'
    ? gallery
    : gallery.filter(g => g.category === selectedCategory);

  return (
    <div>
      <Navbar />

      <div className="page-header">
        <h1>Gallery</h1>
        <p>Glimpses of life at Late Kalpana Chawla Mahila College, Gangakhed</p>
      </div>

      <section className="gallery-section container">

        <div className="dept-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`dept-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading gallery...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ fontSize: '4rem' }}>🖼️</p>
            <h3 style={{ color: '#333', marginBottom: '8px' }}>No Images Yet</h3>
            <p style={{ color: '#888' }}>
              Gallery images will appear here once uploaded by admin.
            </p>
          </div>
        ) : (
          <div className="gallery-grid">
            {filtered.map(item => (
              <div
                className="gallery-item"
                key={item._id}
                onClick={() => setSelectedImage(item)}>
                <img
                  src={`http://localhost:5000/uploads/${item.image}`}
                  alt={item.title}
                />
                <div className="gallery-overlay">
                  <h4>{item.title}</h4>
                  <span>{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </section>

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setSelectedImage(null)}>
              ✕
            </button>
            <img
              src={`http://localhost:5000/uploads/${selectedImage.image}`}
              alt={selectedImage.title}
            />
            <h3>{selectedImage.title}</h3>
            {selectedImage.description && (
              <p>{selectedImage.description}</p>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;
