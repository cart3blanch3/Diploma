import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import AppRoutes from "./routes/AppRoutes"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <AppRoutes />
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            </Router>
        </AuthProvider>
    );
};

export default App;
