import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { login, verify2FA } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { toast } from "react-toastify";
import { getDeviceFingerprint } from "../utils/fingerprint";
import "../styles/AuthModal.css";

Modal.setAppElement("#root");

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Введите корректный email")
    .max(25, "Максимум 25 символов")
    .required("Поле обязательно"),
  password: yup
    .string()
    .max(25, "Максимум 25 символов")
    .required("Поле обязательно"),
});

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
}) => {
  const { login: authLogin } = useAuth();
  const [requires2FA, setRequires2FA] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [is2FASuccess, setIs2FASuccess] = useState(false);
  const [cooldown2FA, setCooldown2FA] = useState(0);
  const [canResendCode, setCanResendCode] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(isOpen);
  const [cachedPassword, setCachedPassword] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSubmitting2FA, setIsSubmitting2FA] = useState(false);


  useEffect(() => {
    setIsLoginOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown2FA > 0) {
      setCanResendCode(false);
      timer = setTimeout(() => {
        setCooldown2FA((prev) => {
          if (prev === 1) setCanResendCode(true);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown2FA]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const handleLoginClose = () => {
    reset();
    setRequires2FA(false);
    setEmail("");
    setCode("");
    setIs2FASuccess(false);
    setCooldown2FA(0);
    setCanResendCode(false);
    setIsLoginOpen(false);
    setCachedPassword("");
    onClose();
  };

  

  const onSubmit = async (data: any) => {
    setIsSubmittingLogin(true);
    try {
      console.log(data);
      const fingerprint = await getDeviceFingerprint(); 
      console.log(fingerprint);
      const response = await login({ ...data, fingerprint });

      if (response.requires2FA) {
        setRequires2FA(true);
        setEmail(data.email);
        setCachedPassword(data.password);
        setCooldown2FA(60);
        toast.info("Код 2FA отправлен на почту");
        return;
      }

      authLogin(sessionStorage.getItem("accessToken") || "");
      toast.success("Успешный вход!");
      handleLoginClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data.detail || "Неизвестная ошибка. Попробуйте позже.";
      toast.error(`${errorMessage}`);
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const onSubmit2FA = async () => {
    setIsSubmitting2FA(true);
    try {
      const fingerprint = await getDeviceFingerprint(); // Получаем fingerprint
      const response = await verify2FA(email, code, fingerprint);

      if (!response || !response.accessToken) {
        throw new Error("Некорректный ответ сервера");
      }

      authLogin(response.accessToken);
      toast.success("2FA успешно подтверждена!");
      setIs2FASuccess(true);
      setTimeout(handleLoginClose, 1500);
    } catch (error: any) {
      const errorMessage =
        error.response?.data.detail || "Неизвестная ошибка. Попробуйте позже.";
      toast.error(`${errorMessage}`);
    } finally {
      setIsSubmitting2FA(false);
    }
  };

  const resend2FACode = async () => {
    try {
      const fingerprint = await getDeviceFingerprint(); // Получаем fingerprint
      await login({ email, password: cachedPassword, fingerprint });
      toast.success("📧 Код отправлен повторно");
      setCooldown2FA(60);
    } catch {
      toast.error("Ошибка при повторной отправке кода");
    }
  };


  return (
    <>
      <Modal
        isOpen={isLoginOpen}
        onRequestClose={handleLoginClose}
        className="modal"
        overlayClassName="overlay"
      >
        <span className="close-icon" onClick={handleLoginClose}>
          &times;
        </span>
        <div className="modal-content">
          <h2>{requires2FA ? "Введите код" : "Вход"}</h2>

          {!requires2FA ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                type="email"
                placeholder="Email"
                maxLength={100}
                {...register("email")}
              />
              {errors.email && <p className="error">{errors.email.message}</p>}

              <input
                type="password"
                placeholder="Пароль"
                maxLength={100}
                {...register("password")}
              />
              {errors.password && (
                <p className="error">{errors.password.message}</p>
              )}

              <button type="submit" disabled={isSubmittingLogin}>
                {isSubmittingLogin ? "Отправка..." : "Войти"}
              </button>

            </form>
          ) : is2FASuccess ? (
            <p className="success-message">
              2FA подтверждена! Выполняется вход...
            </p>
          ) : (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit2FA();
                }}
              >
                <input
                  type="text"
                  placeholder="Код 2FA"
                  value={code}
                  maxLength={10}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button type="submit" disabled={isSubmitting2FA}>
                  {isSubmitting2FA ? "Подтверждение..." : "Подтвердить"}
                </button>
              </form>

              <button
                className="resend-btn"
                onClick={resend2FACode}
                disabled={!canResendCode}
              >
                {canResendCode
                  ? "Отправить код повторно"
                  : `Отправить повторно через ${cooldown2FA}с`}
              </button>
            </>
          )}

          {!requires2FA && (
            <>
              <p
                className="forgot-password"
                onClick={() => setIsForgotPasswordOpen(true)}
              >
                Забыли пароль?
              </p>
              <p className="switch-modal" onClick={onOpenRegister}>
                Нет аккаунта? <span>Зарегистрируйтесь!</span>
              </p>
            </>
          )}
        </div>
      </Modal>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </>
  );
};

export default LoginModal;
