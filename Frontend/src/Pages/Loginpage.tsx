import React, { useState, FormEvent, ChangeEvent } from 'react';
import './css/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { loginApi, signupApi } from "../api"; 

// Type Definitions
type TabType = 'login' | 'signup';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials extends LoginCredentials {
  name: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
}

// Validator utility
class Validator {
  static validateEmail(email: string): string | undefined {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? undefined : 'Please enter a valid email address';
  }

  static validatePassword(password: string): string | undefined {
    return password.length >= 6 ? undefined : 'Password must be at least 6 characters';
  }

  static validateName(name: string): string | undefined {
    return name.trim().length >= 2 ? undefined : 'Please enter your name';
  }
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginErrors, setLoginErrors] = useState<ValidationErrors>({});

  // Signup form state
  const [signupName, setSignupName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupErrors, setSignupErrors] = useState<ValidationErrors>({});

  // Tab switching
  const switchTab = (tab: TabType): void => {
    setActiveTab(tab);
    // Clear errors when switching tabs
    setLoginErrors({});
    setSignupErrors({});
  };

  // Handle login form submission


const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const errors: ValidationErrors = {};
  const emailError = Validator.validateEmail(loginEmail);
  const passwordError = Validator.validatePassword(loginPassword);

  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;

  setLoginErrors(errors);

  if (Object.keys(errors).length === 0) {
    try {
      const data = await loginApi(loginEmail, loginPassword);

      // ✅ Store user data (session cookie is set automatically by the server)
      localStorage.setItem("user", JSON.stringify(data.user));

      // reset form
      setLoginEmail("");
      setLoginPassword("");

      // go to analysis page
      navigate("/Analysis");
    } catch (err: any) {
      setLoginErrors({ email: err.message });
    }
  }
};
  // Handle signup form submission
 const handleSignupSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const errors: ValidationErrors = {};
  const nameError = Validator.validateName(signupName);
  const emailError = Validator.validateEmail(signupEmail);
  const passwordError = Validator.validatePassword(signupPassword);

  if (nameError) errors.name = nameError;
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;

  setSignupErrors(errors);

  if (Object.keys(errors).length === 0) {
    try {
      await signupApi(signupName, signupEmail, signupPassword);

      // reset form
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");

      // go to login
      switchTab("login");
    } catch (err: any) {
      setSignupErrors({ email: err.message });
    }
  }
};

  // Clear errors on input change
  const handleLoginEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setLoginEmail(e.target.value);
    if (loginErrors.email) {
      setLoginErrors({ ...loginErrors, email: undefined });
    }
  };

  const handleLoginPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setLoginPassword(e.target.value);
    if (loginErrors.password) {
      setLoginErrors({ ...loginErrors, password: undefined });
    }
  };

  const handleSignupNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSignupName(e.target.value);
    if (signupErrors.name) {
      setSignupErrors({ ...signupErrors, name: undefined });
    }
  };

  const handleSignupEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSignupEmail(e.target.value);
    if (signupErrors.email) {
      setSignupErrors({ ...signupErrors, email: undefined });
    }
  };

  const handleSignupPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSignupPassword(e.target.value);
    if (signupErrors.password) {
      setSignupErrors({ ...signupErrors, password: undefined });
    }
  };

  return (
    <div className="page-container">
      <div className="logo-container">
        <div className="shield-icon"></div>
        <div className="logo-text">Truth Guard</div>
      </div>

      <div className="login-container">
        <div className="welcome-text">
          <h1>Welcome to Truth Guard</h1>
          <p>Your trusted fake news detection system</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="loginEmail">Email</label>
              <input
                type="email"
                id="loginEmail"
                value={loginEmail}
                onChange={handleLoginEmailChange}
                placeholder="your@email.com"
                className={loginErrors.email ? 'error' : ''}
                required
              />
              {loginErrors.email && (
                <div className="error-message show">{loginErrors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <input
                type="password"
                id="loginPassword"
                value={loginPassword}
                onChange={handleLoginPasswordChange}
                placeholder="••••••••"
                className={loginErrors.password ? 'error' : ''}
                required
              />
              {loginErrors.password && (
                <div className="error-message show">{loginErrors.password}</div>
              )}
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="signup-form">
            <div className="form-group">
              <label htmlFor="signupName">Full Name</label>
              <input
                type="text"
                id="signupName"
                value={signupName}
                onChange={handleSignupNameChange}
                placeholder="Ramji Bhai"
                className={signupErrors.name ? 'error' : ''}
                required
              />
              {signupErrors.name && (
                <div className="error-message show">{signupErrors.name}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="signupEmail">Email</label>
              <input
                type="email"
                id="signupEmail"
                value={signupEmail}
                onChange={handleSignupEmailChange}
                placeholder="your@email.com"
                className={signupErrors.email ? 'error' : ''}
                required
              />
              {signupErrors.email && (
                <div className="error-message show">{signupErrors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="signupPassword">Password</label>
              <input
                type="password"
                id="signupPassword"
                value={signupPassword}
                onChange={handleSignupPasswordChange}
                placeholder="••••••••"
                className={signupErrors.password ? 'error' : ''}
                required
              />
              {signupErrors.password && (
                <div className="error-message show">{signupErrors.password}</div>
              )}
            </div>

            <button type="submit" className="login-button">
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
};






export default LoginPage;