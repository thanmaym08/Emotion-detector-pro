import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";

interface CameraPageProps {
    setCaptures: Function;
    setPredictions: Function;
    isCapturing: boolean;
    setIsCapturing: Function;
    setError: Function;
}

const CameraPage: React.FC<CameraPageProps> = ({
    setCaptures,
    setPredictions,
    isCapturing,
    setIsCapturing,
    setError,
}) => {
    const webcamRef = useRef<Webcam>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isCapturing) return;

        const interval = setInterval(async () => {
            if (!webcamRef.current) return;

            const screenshot = webcamRef.current.getScreenshot();
            if (!screenshot) return;

            const blob = await (await fetch(screenshot)).blob();
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append("file", file);

            try {
                setLoading(true);
                setError(null);
                const res = await axios.post("http://localhost:8000/predict", formData);
                const emotionProbs = res.data.probabilities;
                const top = res.data.label;

                setPredictions(emotionProbs);

                setCaptures((prev: any[]) => {
                    const newCapture = { image: screenshot, emotion: top };
                    const updated = [newCapture, ...prev].slice(0, 5);
                    if (updated.length === 5) setIsCapturing(false);
                    return updated;
                });
            } catch (err) {
                console.error("Prediction error:", err);
                setError("Failed to fetch prediction. Please check backend.");
            } finally {
                setLoading(false);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isCapturing]);

    return (
        <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl mb-4 font-semibold underline">Live Camera</h2>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-xl shadow-2xl border-4 border-white"
                width={500}
            />
            {loading && <div className="mt-4 animate-pulse text-xl">Processing...</div>}
        </div>
    );
};

export default CameraPage;
