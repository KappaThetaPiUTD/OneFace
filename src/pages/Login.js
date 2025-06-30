import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp, confirmSignUp, signIn, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import '../amplify-config';
import "../styles/Login.css";

const API_BASE_URL = "https://njs67kowh1.execute-api.us-east-2.amazonaws.com/Dev";

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
  const [pendingUserData, setPendingUserData] = useState(null);

  const navigate = useNavigate();

  // Check for existing session on component mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        onLogin();
        navigate("/dashboard");
      }
    } catch (error) {
      console.log("No existing session found");
    }
  };

  // Login function using Cognito
  const attemptLogin = async (username, password) => {
    console.log("🔐 Attempting login for:", username);
    const { isSignedIn, nextStep } = await signIn({ username, password });
    
    if (isSignedIn) {
      console.log("✅ Cognito login successful!");
      
      // Get user data from your API after successful login
      try {
        console.log("🔍 Getting current user and tokens...");
        const user = await getCurrentUser();
        console.log("👤 Current user:", user?.username || user?.userId);
        
        // Use fetchAuthSession instead of getSignInUserSession
        const { tokens } = await fetchAuthSession();
        console.log("🎫 Tokens received:", tokens ? "✅" : "❌");
        
        if (!tokens?.idToken) {
          console.error("❌ No idToken found in session");
          return { isSignedIn, nextStep };
        }
        
        const idToken = tokens.idToken.toString();
        console.log("🔑 ID Token length:", idToken.length);
        
        // Store the token
        localStorage.setItem("idToken", idToken);
        console.log("💾 Token stored in localStorage");
        
        // TODO: TEMPORARILY DISABLED - Fix CORS on /user endpoint first
        // Try to call your API to create/get user data
        console.log("⚠️ Skipping /user API call due to CORS issue - login will proceed without user data sync");
        /*
        console.log("🌐 Making API call to /user endpoint...");
        try {
          const userRes = await fetch(`${API_BASE_URL}/user`, {
            method: "GET",
            headers: { 
              "Authorization": `Bearer ${idToken}`,
              "Content-Type": "application/json"
            }
          });
          
          console.log("📡 API Response status:", userRes.status);
          console.log("📡 API Response ok:", userRes.ok);
          
          if (userRes.ok) {
            const userData = await userRes.json();
            localStorage.setItem("userData", JSON.stringify(userData));
            console.log("✅ User data fetched successfully:", userData);
          } else {
            const errorText = await userRes.text();
            console.warn("⚠️ Failed to fetch user data, status:", userRes.status, "body:", errorText);
          }
        } catch (apiError) {
          console.error("❌ API call failed:", apiError);
          console.error("API Error details:", {
            name: apiError.name,
            message: apiError.message,
            stack: apiError.stack
          });
        }
        */
        
      } catch (userError) {
        console.error("❌ Failed to get user session:", userError);
        console.error("User session error details:", {
          name: userError.name, 
          message: userError.message,
          stack: userError.stack
        });
      }
    } else {
      console.log("❌ Cognito login failed or incomplete");
    }
    
    return { isSignedIn, nextStep };
  };

  // Signup function - hybrid approach using both custom API and Cognito
  const attemptSignup = async (username, email, password, name) => {
    console.log("Attempting signup with:", { username, email, password: "***", name });
    
    // Generate a username that's not in email format
    const emailPrefix = email.split('@')[0];
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const cognitoUsername = `${emailPrefix}_${randomSuffix}`;
    
    // First, call your custom API to create user in DynamoDB
    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: cognitoUsername, 
          password: password,
          email: email,
          name: name
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      const result = await res.json();
      console.log("DynamoDB user created successfully:", result);
      
      return { 
        isSignUpComplete: false, 
        nextStep: { signUpStep: 'CONFIRM_SIGN_UP' }, 
        username: cognitoUsername 
      };
      
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  // Confirm signup with verification code
  const confirmSignup = async (username, verificationCode) => {
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username,
      confirmationCode: verificationCode
    });
    
    return { isSignUpComplete, nextStep };
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
      // Confirm signup with verification code
      await confirmSignup(pendingUserData.username, verificationCode);

      // Now try to sign in the user using REST API
      const tokens = await attemptLogin(pendingUserData.username, pendingUserData.password);
      console.log("Signed in! Token:", tokens.idToken);

      onLogin();
      navigate("/dashboard");
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
        // For login, we need to try different username formats since we don't know the exact username
        // Try email first, then try generated username format
        try {
          const { isSignedIn } = await attemptLogin(email, password);
          console.log("Signed in!", isSignedIn);

          if (isSignedIn) {
            onLogin();
            navigate("/dashboard");
          }
        } catch (emailLoginError) {
          // If email login fails, it might be because we need the generated username
          // Unfortunately, we don't store the generated username anywhere
          // For now, show error but in production you'd want to store this mapping
          console.error("Login failed with email:", emailLoginError.message);
          setErrors({ general: "Login failed. Please check your credentials." });
        }
      } else {
        // Use Cognito for signup - this will push to DynamoDB
        const result = await attemptSignup(name, email, password, name);
        console.log("Sign-up successful:", result);
        
        // Handle both success and permission error cases
        if (result.isSignUpComplete || result.nextStep) {
          // Store pending user data for verification
          setPendingUserData({
            username: result.username,
            email: email,
            password: password
          });
          
          setIsVerifying(true);
          setErrors({});
        }
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
    setPendingUserData(null);
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
