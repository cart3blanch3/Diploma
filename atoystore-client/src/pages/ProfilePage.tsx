import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/ProfilePage.css";

interface User {
    id: string;
    email: string;
    fullName: string;
    twoFactorEnabled: boolean;
}

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [updatedFullName, setUpdatedFullName] = useState("");
    const [updatedEmail, setUpdatedEmail] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await api.get("/profile");
                setUser(profileRes.data);
                setUpdatedFullName(profileRes.data.fullName);
                setUpdatedEmail(profileRes.data.email);
            } catch (error) {
                console.error("Ошибка при загрузке профиля:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        try {
            await api.put("/profile", {
                ...user,
                fullName: updatedFullName,
                email: updatedEmail,
            });
            setUser((prev) => prev ? { ...prev, fullName: updatedFullName, email: updatedEmail } : null);
            setEditing(false);
        } catch (err) {
            console.error("Ошибка при обновлении профиля:", err);
        }
    };

    const toggle2FA = async () => {
        try {
            const newValue = !user?.twoFactorEnabled;
            await api.post(`/profile/2fa?enabled=${newValue}`);
            setUser((prev) => prev ? { ...prev, twoFactorEnabled: newValue } : null);
        } catch (err) {
            console.error("Ошибка при обновлении 2FA:", err);
        }
    };

    if (loading) return <p>Загрузка...</p>;

    return (
        <div className="profile-page">
            <h2>Профиль пользователя</h2>

            {user && (
                <div className="profile-section">
                    <label>Имя:</label>
                    {editing ? (
                        <input maxLength={25} value={updatedFullName} onChange={e => setUpdatedFullName(e.target.value)} />
                    ) : (
                        <p>{user.fullName}</p>
                    )}

                    <label>Email:</label>
                    {editing ? (
                        <input maxLength={25} value={updatedEmail} onChange={e => setUpdatedEmail(e.target.value)} />
                    ) : (
                        <p>{user.email}</p>
                    )}

                    <label>Двухфакторная аутентификация:</label>
                    <p>{user.twoFactorEnabled ? "Включена" : "Отключена"}</p>
                    <button onClick={toggle2FA}>
                        {user.twoFactorEnabled ? "Отключить 2FA" : "Включить 2FA"}
                    </button>

                    {editing ? (
                        <div>
                            <button onClick={handleSave}>Сохранить</button>
                            <button onClick={() => setEditing(false)}>Отмена</button>
                        </div>
                    ) : (
                        <button onClick={() => setEditing(true)}>Редактировать</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
