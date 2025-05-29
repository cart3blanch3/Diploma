import React from "react";

interface StarRatingProps {
    rating: number;
    max?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, max = 5 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = max - fullStars - (halfStar ? 1 : 0);

    return (
        <div style={{ display: "flex", gap: 2 }}>
            {Array(fullStars).fill("★").map((s, i) => (
                <span key={`full-${i}`} style={{ color: "#f2b01e" }}>{s}</span>
            ))}
            {halfStar && <span style={{ color: "#f2b01e" }}>☆</span>}
            {Array(emptyStars).fill("☆").map((s, i) => (
                <span key={`empty-${i}`} style={{ color: "#ccc" }}>{s}</span>
            ))}
        </div>
    );
};

export default StarRating;
