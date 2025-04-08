import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { resetPassword } from "../services/authService";
import LoginModal from "../components/LoginModal";
import "../styles/AuthModal.css";

Modal.setAppElement("#root");

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(12, "Пароль должен содержать минимум 12 символов")
    .max(100, "Пароль не должен превышать 100 символов")
    .matches(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
    .matches(/[a-z]/, "Пароль должен содержать хотя бы одну строчную букву")
    .matches(/\d/, "Пароль должен содержать хотя бы одну цифру")
    .matches(/\W/, "Пароль должен содержать хотя бы один спецсимвол")
    .required("Поле обязательно"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), undefined], "Пароли должны совпадать")
    .required("Подтвердите пароль"),
});

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [message, setMessage] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCurrentModalOpen, setIsCurrentModalOpen] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const handleResetPassword = async (data: any) => {
    try {
      await resetPassword({ email, token, newPassword: data.newPassword });
      setMessage("Пароль успешно сброшен!");
      setTimeout(() => {
        setIsLoginOpen(true);
        setIsCurrentModalOpen(false);
      }, 500);
    } catch (error) {
      setMessage("Ошибка сброса пароля");
    }
  };

  const handleClose = () => {
    setIsCurrentModalOpen(false);
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {}}
      />

      {isCurrentModalOpen && (
        <div className="overlay">
          <div className="modal">
            <span className="close-icon" onClick={handleClose}>
              &times;
            </span>
            <h2>Сброс пароля</h2>
            <form onSubmit={handleSubmit(handleResetPassword)}>
              <input
                type="password"
                placeholder="Введите новый пароль"
                maxLength={100}
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="error">{errors.newPassword.message}</p>
              )}

              <input
                type="password"
                placeholder="Повторите пароль"
                maxLength={100}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="error">{errors.confirmPassword.message}</p>
              )}

              <button type="submit" disabled={!isValid}>
                Сбросить пароль
              </button>
            </form>

            {message && (
              <p
                className={`message ${
                  message.includes("Ошибка") ? "error" : "success"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPasswordPage;
