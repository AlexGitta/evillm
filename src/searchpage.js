import React, { useState, useEffect } from 'react';
import { queryGemini } from './geminiService';

import './searchpage.css';

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showTos, setShowTos] = useState(false);
  const [tosContent, setTosContent] = useState('');
  const [additionalBoxes, setAdditionalBoxes] = useState([]);

  // Load Terms of Service when needed
  useEffect(() => {
    if (showTos && !tosContent) {
      const loadTermsOfService = async () => {
        try {
          const response = await fetch('TOS.txt');
          const text = await response.text();
          setTosContent(text);
        } catch (err) {
          console.error('Error loading Terms of Service:', err);
          setTosContent('ERROR LOADING TERMS OF SERVICE. PLEASE REPORT TO YOUR LOCAL COMPLIANCE OFFICER.');
        }
      };
      
      loadTermsOfService();
    }
  }, [showTos, tosContent]);

  const preventUncheck = (e) => {
    e.preventDefault();
    return false;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
  
    if (!searchTerm.trim()) return;
  
    setLoading(true);
    setError(null);
    setResult('');
    setAdditionalBoxes([]); // Clear previous boxes
  
    try {
      // Send query to Gemini API
      const response = await queryGemini(searchTerm);
      setResult(response);
      setShowResults(true);
  
      // Add additional boxes
      setAdditionalBoxes([
        { id: 1, label: 'Restricted' },
        { id: 2, label: 'Censored' },
        { id: 3, label: 'Sensitive' },
        { id: 4, label: 'Confidential' },
      ]);
    } catch (err) {
      setError('Error: ' + (err.message || 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleLucky = async () => {
    setSearchTerm('What is Luck'); // Set the search term
    setLoading(true);
    setError(null);
    setResult('');
  
    try {
      // Send query to Gemini API
      const response = await queryGemini('What is Luck');
      setResult(response);
      setShowResults(true);
    } catch (err) {
      setError('Error: ' + (err.message || 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  // Go back to search
  const handleBack = () => {
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <div className="search-page">
      {!showResults ? (
        // Search Page
        <>
          <div className="logo-container">
            <h1 className="logo">Department of Information</h1>
          </div>
          
          <div className="search-container">
            <form onSubmit={handleSearch}>
              <div className="search-input-container">
                <input
                  type="text"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for information..."
                  disabled={loading}
                />
              </div>
              
              <div className="buttons-container">
                <button type="submit" className="search-button" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </button>
                <button 
                  type="button" 
                  className="lucky-button" 
                  onClick={handleLucky}
                  disabled={loading}
                >
                  I'm Feeling Lucky
                </button>
                <button 
                  type="button" 
                  className="tos-button" 
                  onClick={() => setShowTos(true)}
                >
                  Terms of Service
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        // Results Page
        
        
        <div className="results-page">
          <div className="results-header">
            <button onClick={handleBack} className="back-button">
              ← BACK TO SEARCH
            </button>
            <h2>APPROVED RESULTS FOR: {searchTerm}</h2>
          </div>
          
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="results-content">
                {result.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>

             {/* Add heading for additional boxes */}
            <h3 className="additional-boxes-heading">Other Responses</h3>
            <div className="additional-boxes">
              {additionalBoxes.map((box) => (
                <div key={box.id} className="additional-box">
                  {box.label}
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      )}
      {/* Terms of Service Modal */}
      {showTos && (
        <div className="tos-modal">
          <div className="tos-header">
            <h2>Department of Information</h2>
            <p>UNIFIED SEARCH PORTAL TERMS OF SERVICE</p>
            <p>DECREE 147/2026</p>
          </div>
          
          <div className="consent-container">
            <input 
              type="checkbox" 
              className="consent-checkbox" 
              checked={true} 
              onChange={preventUncheck}
              onClick={preventUncheck}
            />
            <span className="consent-text">
              I ACKNOWLEDGE THAT I HAVE READ, UNDERSTOOD, AND CONSENTED TO ALL TERMS
            </span>
          </div>
          
          <div className="tos-content">
            <div className="tos-body">
              {tosContent ? (
                tosContent.split('##').map((section, index) => {
                  if (index === 0) return null; // Skip the first split which is the header
                  
                  const sectionLines = section.trim().split('\n');
                  const sectionTitle = sectionLines[0].trim();
                  const sectionContent = sectionLines.slice(1).join('\n');
                  
                  return (
                    <div key={index} className="tos-section">
                      <h3>## {sectionTitle}</h3>
                      <div dangerouslySetInnerHTML={{ 
                        __html: sectionContent
                          .replace(/\n\n/g, '<br><br>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\* (.*?)$/gm, '• $1<br>')
                      }} />
                    </div>
                  );
                })
              ) : (
                <div className="tos-section">
                  <p>LOADING TERMS OF SERVICE...</p>
                  <p>PLEASE STAND BY. YOUR PATIENCE IS MANDATORY.</p>
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="tos-close" 
            onClick={() => setShowTos(false)}
          >
            ACKNOWLEDGE AND CLOSE
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchPage;