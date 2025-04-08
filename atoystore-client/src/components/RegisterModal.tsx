import React, { useState } from "react";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { register as registerUser } from "../services/authService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AuthModal.css";

Modal.setAppElement("#root");

const schema = yup.object().shape({
  fullName: yup.string().max(50, "Максимум 50 символов").required("Введите имя"),
  email: yup.string().email("Введите корректный email").max(100).required("Поле обязательно"),
  password: yup
    .string()
    .min(12, "Пароль должен содержать минимум 12 символов")
    .max(100)
    .matches(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
    .matches(/[a-z]/, "Пароль должен содержать хотя бы одну строчную букву")
    .matches(/\d/, "Пароль должен содержать хотя бы одну цифру")
    .matches(/\W/, "Пароль должен содержать хотя бы один спецсимвол")
    .required("Поле обязательно")
    .test("not-email", "Пароль не должен совпадать с email", function (value) {
      const { email } = this.parent;
      return value !== email;
    }),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Пароли должны совпадать")
    .required("Подтвердите пароль"),
  enableTwoFactor: yup.boolean(),
});

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onOpenLogin }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ resolver: yupResolver(schema), mode: "onChange" });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      toast.success("Регистрация успешна! Проверьте почту.");
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data.detail || "Неизвестная ошибка. Попробуйте позже.";
      toast.error(`${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="overlay"
    >
      <span className="close-icon" onClick={onClose}>&times;</span>
      <div className="modal-content">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="text" placeholder="Имя" maxLength={50} {...register("fullName")} />
          {errors.fullName && <p className="error">{errors.fullName.message}</p>}

          <input type="email" placeholder="Email" maxLength={100} {...register("email")} />
          {errors.email && <p className="error">{errors.email.message}</p>}

          <input type="password" placeholder="Пароль" maxLength={100} {...register("password")} />
          {errors.password && <p className="error">{errors.password.message}</p>}

          <input type="password" placeholder="Повторите пароль" maxLength={100} {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}

          <label className="switch">
            <input type="checkbox" {...register("enableTwoFactor")} />
            <span className="slider"></span>
          </label>
          <span className="switch-text">Вход с подтверждением по email-коду</span>

          <button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
        <p className="switch-modal" onClick={onOpenLogin}>
          Уже есть аккаунт? <span>Войти!</span>
        </p>
      </div>
    </Modal>
  );
};

export default RegisterModal;
