import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../amplify-config';
import { signUp, signIn, fetchAuthSession, confirmSignUp, signOut, getCurrentUser } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';
import "../styles/Login.css";

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [pendingUsername, setPendingUsername] = useState("");

  const navigate = useNavigate();

  // Check for existing session on component mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        // User is already signed in, get their session
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        
        if (token) {
          localStorage.setItem("idToken", token);
          
          // Try to get user data from API using Amplify API client
          try {
            const response = await get({
              apiName: 'oneface_gateway',
              path: '/get_user',
              options: {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            });
            localStorage.setItem("userData", JSON.stringify(response));
          } catch (apiError) {
            console.warn("API call failed:", apiError.message);
            // Store a placeholder user data so the app can continue
            const placeholderData = {
              message: "User data unavailable due to API configuration",
              timestamp: new Date().toISOString()
            };
            localStorage.setItem("userData", JSON.stringify(placeholderData));
          }
          
          onLogin();
          navigate("/dashboard");
        }
      }
    } catch (error) {
      // No existing session or error - user needs to sign in
      console.log("No existing session found");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin && !name) {
      newErrors.name = "Name is required";
    }

    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerificationCode = () => {
    const newErrors = {};
    
    if (!verificationCode) {
      newErrors.verificationCode = "Verification code is required";
    } else if (verificationCode.length !== 6) {
      newErrors.verificationCode = "Verification code must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerification = async (e) => {
    e.preventDefault();

    if (!validateVerificationCode()) return;

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: pendingUsername,
        confirmationCode: verificationCode
      });

      if (isSignUpComplete) {
        console.log("Account verified successfully!");
        
        // Now sign in the user automatically
        const { isSignedIn } = await signIn({ 
          username: pendingUsername, 
          password 
        });

        if (isSignedIn) {
          const session = await fetchAuthSession();
          const token = session.tokens?.idToken?.toString();

          localStorage.setItem("idToken", token);
          console.log("Signed in! Token:", token);

          // Make API call to get user data
          try {
            const response = await get({
              apiName: 'oneface_gateway',
              path: '/get_user',
              options: {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            });
            console.log("User data from API:", response);
            localStorage.setItem("userData", JSON.stringify(response));
          } catch (apiError) {
            console.warn("API call failed:", apiError.message);
            // Store placeholder data so the app can continue
            const placeholderData = {
              message: "User data unavailable due to API configuration",
              timestamp: new Date().toISOString()
            };
            localStorage.setItem("userData", JSON.stringify(placeholderData));
          }

          onLogin();
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setErrors({ general: err.message });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    try {
      if (isLogin) {
        // Check if user is already signed in and sign them out first
        try {
          await signOut();
        } catch (signOutError) {
          console.log("No existing session to sign out");
        }

        const { isSignedIn } = await signIn({ username: email, password });
  
        if (isSignedIn) {
          const session = await fetchAuthSession();
          const token = session.tokens?.idToken?.toString();
  
          localStorage.setItem("idToken", token);
          console.log("Signed in! Token:", token);

          // // Make API call to get user data
          // try {
          //   const response = await get({
          //     apiName: 'oneface_gateway',
          //     path: '/get_user',
          //     options: {
          //       headers: {
          //         Authorization: `Bearer ${token}`
          //       }
          //     }
          //   });
          //   console.log("User data from API:", response);
          //   localStorage.setItem("userData", JSON.stringify(response));
          // } catch (apiError) {
          //   console.warn("API call failed:", apiError.message);
          //   // Store placeholder data so the app can continue
          //   const placeholderData = {
          //     message: "User data unavailable due to API configuration",
          //     timestamp: new Date().toISOString()
          //   };
          //   localStorage.setItem("userData", JSON.stringify(placeholderData));
          // }

          onLogin();
          navigate("/dashboard");
        }
      } else {
        const { userId } = await signUp({
          username: name,
          password,
          options: {
            userAttributes: {
              email,
              name
            }
          }
        });
  
        console.log("Sign-up successful:", userId);
        setPendingUsername(name);
        setIsVerifying(true);
        setErrors({});
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrors({ general: err.message });
    }
  };
  

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsVerifying(false);
    setErrors({});
    setVerificationCode("");
    setPendingUsername("");
  };

  const backToSignUp = () => {
    setIsVerifying(false);
    setErrors({});
    setVerificationCode("");
  };

  if (isVerifying) {
    return (
      <div className="login-page theme-transition">
        <div className="login-container">
          <div className="logo-area">
            <div className="app-logo">
              <span className="logo-text">OneFace</span>
            </div>
            <h2>Verify Your Email</h2>
            <p>We've sent a verification code to {email}</p>
          </div>

          <div className="form-area">
            <h1>Enter Verification Code</h1>
            {errors.general && <div className="error-message">{errors.general}</div>}

            <form onSubmit={handleVerification}>
              <div className="form-group">
                <label htmlFor="verificationCode">6-Digit Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className={errors.verificationCode ? "error" : ""}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  placeholder="000000"
                />
                {errors.verificationCode && <span className="error-message">{errors.verificationCode}</span>}
              </div>

              <button type="submit" className="submit-button">
                Verify and Sign In
              </button>
            </form>

            <div className="mode-toggle">
              <button onClick={backToSignUp} className="toggle-button">
                Back to Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page theme-transition">
      <div className="login-container">
        <div className="logo-area">
          <div className="app-logo">
            <span className="logo-text">OneFace</span>
          </div>
          <h2>Welcome to OneFace</h2>
          <p>Attendance management made simple</p>
        </div>

        <div className="form-area">
          <h1>{isLogin ? "Sign In" : "Create Account"}</h1>
          {errors.general && <div className="error-message">{errors.general}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "error" : ""}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "error" : ""}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "error" : ""}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "error" : ""}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}

            {isLogin && (
              <div className="form-options">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
              </div>
            )}

            <button type="submit" className="submit-button">
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mode-toggle">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={toggleMode} className="toggle-button">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
