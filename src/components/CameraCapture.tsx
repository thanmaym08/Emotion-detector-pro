import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './CameraCapture.css';

interface CameraCaptureProps {
    onCapture: (image: string, emotion: string) => void;
    disabled: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, disabled }) => {
    const webcamRef = useRef<Webcam>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCapture = async () => {
        if (!webcamRef.current) return;

        const screenshot = webcamRef.current.getScreenshot();
        if (!screenshot) return;

        const blob = await (await fetch(screenshot)).blob();
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            setError(null);
            const res = await axios.post('http://localhost:8000/predict', formData);
            const top = res.data.label;
            onCapture(screenshot, top);
        } catch (err) {
            console.error('Prediction error:', err);
            setError('Failed to fetch prediction. Please check backend.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="camera-capture-container">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="webcam-video"
            />
            <button
                onClick={handleCapture}
                disabled={disabled || loading}
                className="capture-button"
            >
                {loading ? 'Processing...' : 'Capture Emotion'}
            </button>
            {error && <div className="error-text">{error}</div>}
        </div>
    );
};

export default CameraCapture;
