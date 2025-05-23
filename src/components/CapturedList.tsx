// src/components/CapturedList.tsx
import React from 'react';

interface Capture {
    image: string;
    emotion: string;
}

interface CapturedListProps {
    captures: Capture[];
}

const CapturedList: React.FC<CapturedListProps> = ({ captures }) => (
    <div className="w-full">
        <h3 className="text-xl font-semibold mb-4">Captured Emotions</h3>
        <ul className="space-y-4">
            {captures.map((cap, idx) => (
                <li
                    key={idx}
                    className="flex items-center space-x-4 bg-white bg-opacity-20 rounded-lg p-2 shadow"
                >
                    <img
                        src={cap.image}
                        alt={`cap-${idx}`}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-white"
                    />
                    <span className="text-lg font-medium">{cap.emotion}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default CapturedList;
