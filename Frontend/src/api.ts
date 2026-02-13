const API_URL = "http://localhost:3001";

// LOGIN
export async function loginApi(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Login failed");
  }

  return response.json(); // { message, user }
}

// SIGNUP
export async function signupApi(
  name: string,
  email: string,
  password: string
) {
  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Signup failed");
  }

  return response.json();
}

// LOGOUT
export async function logoutApi() {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    return response.json();
  } catch (err) {
    // Don't throw on logout, just clear local data
    console.error("Logout error:", err);
  }
}

// PREDICT - Analyze news
export async function predictApi(newsText: string) {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ news: newsText }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Prediction failed");
  }

  return response.json();
}

// GET MY ANALYSIS
export async function getMyAnalysisApi() {
  const response = await fetch(`${API_URL}/my-analysis`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch analysis");
  }

  return response.json();
}
