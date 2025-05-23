import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CameraCapture from '../components/CameraCapture';
import './Analytics.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Capture {
    image: string;
    emotion: string;
}

const AnalyticsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialCaptures: Capture[] = location.state?.captures || [];

    const [captures, setCaptures] = useState<Capture[]>(initialCaptures);
    const [showAnalytics, setShowAnalytics] = useState(true);

    const emotionCounts: { [key: string]: number } = {};

    // Count the occurrences of each emotion
    captures.forEach((capture) => {
        emotionCounts[capture.emotion] = (emotionCounts[capture.emotion] || 0) + 1;
    });

    // Find the most frequent emotion
    const mostFrequentEmotion = Object.keys(emotionCounts).reduce((a, b) =>
        emotionCounts[a] > emotionCounts[b] ? a : b
    );

    const handleBack = () => {
        navigate('/');
    };

    // ✅ Full chart data for all emotions
    const chartData = {
        labels: Object.keys(emotionCounts),
        datasets: [
            {
                label: 'Emotion Counts',
                data: Object.values(emotionCounts),
                backgroundColor: '#3498db',
            },
        ],
    };

    const getRecommendation = (emotion: string) => {
        switch (emotion) {
            case 'Happy':
                return 'Keep up the good mood! Share your positivity with others!';
            case 'Sad':
                return 'Take a deep breath. It’s okay to feel this way. Reach out to a friend!';
            case 'Angry':
                return 'Take a break and cool down. Consider some deep breathing exercises.';
            case 'Surprised':
                return 'Wow! Something unexpected must have happened. Take a moment to process.';
            case 'Fear':
                return 'Try to relax and breathe deeply. Everything will be okay!';
            default:
                return 'Stay positive and take care of yourself!';
        }
    };

    return (
        <div className="analytics-container">
            <h1 className="analytics-title">Emotion Analytics</h1>
            {captures.length === 0 ? (
                <p className="no-captures-text">No captures available yet.</p>
            ) : (
                <>
                    {/* Most Frequent Emotion Section */}
                    <div className="most-frequent-emotion">
                        <h2>Most Frequent Emotion: {mostFrequentEmotion}</h2>
                        <p>{getRecommendation(mostFrequentEmotion)}</p>
                    </div>

                    {/* ✅ Show chart for all emotions */}
                    <div className="emotion-chart">
                        <Bar data={chartData} />
                    </div>

                    {/* ✅ Show all images with their respective emotions */}
                    <div className="images-and-emotions">
                        {captures.map((capture, index) => (
                            <div key={index} className="analytics-card">
                                <img
                                    src={capture.image}
                                    alt={`Capture ${index + 1}`}
                                    className="analytics-image"
                                />
                                <p className="analytics-emotion">{capture.emotion}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
            <button onClick={handleBack} className="back-btn">Back to Home</button>
        </div>
    );
};

export default AnalyticsPage;
