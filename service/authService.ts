const API_BASE_URL = 'https://califoniaemporium.com/api/v1'; 

export const loginWithGoogle = async (accessToken: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login/google/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Google login failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Google login API error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};