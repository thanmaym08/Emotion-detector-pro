import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CameraCapture from '../components/CameraCapture';
import CapturedList from '../components/CapturedList';
import { useNavigate } from 'react-router-dom';
import './Home.css';

interface Capture {
    image: string;
    emotion: string;
}

const Home = () => {
    const [captures, setCaptures] = useState<Capture[]>([]);
    const navigate = useNavigate();

    const handleCapture = (image: string, emotion: string) => {
        setCaptures((prev) => {
            const updated = [{ image, emotion }, ...prev].slice(0, 5);
            return updated;
        });
    };

    const handleRetake = () => {
        setCaptures([]); // Clear all captures
    };

    const handleViewAnalytics = () => {
        navigate('/analytics', { state: { captures } });
    };

    return (
        <div className="home-container">
            <Navbar />
            <div className="content-wrapper">
                <div className="camera-section">
                    <div className="camera-controls">

                        <CameraCapture onCapture={handleCapture} disabled={captures.length >= 5} />

                        <button onClick={handleRetake} className="retake-btn">
                            Retake / Reset
                        </button>
                        {captures.length >= 5 && (
                            <button onClick={handleViewAnalytics} className="view-analytics-btn">
                                View Analytics
                            </button>
                        )}
                        <div className="captures-grid">
                            {captures.map((cap, index) => (
                                <div key={index} className="capture-item">
                                    <img src={cap.image} alt={`capture-${index}`} className="captured-image" />
                                    <div className="emotion-label">{cap.emotion}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
