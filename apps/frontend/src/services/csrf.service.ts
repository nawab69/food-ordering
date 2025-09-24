class CsrfService {
    private csrfToken: string | null = null;
    private tokenExpiry: number = 0;

    /**
     * Get CSRF token, fetching if needed or expired
     */
    async getToken(): Promise<string> {
        const now = Date.now();

        // Return cached token if still valid (with 5 minute buffer)
        if (this.csrfToken && now < this.tokenExpiry - 5 * 60 * 1000) {
            console.log('CSRF Frontend: Using cached token:', this.csrfToken.substring(0, 20) + '...');
            return this.csrfToken;
        }

        console.log('CSRF Frontend: Fetching new token...');

        // Fetch new token
        try {
            const response = await fetch('http://localhost:3000/api/auth/csrf', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch CSRF token: ${response.status}`);
            }

            const data = await response.json();
            console.log('CSRF Frontend: Received token:', data.token.substring(0, 20) + '...');

            this.csrfToken = data.token;
            this.tokenExpiry = now + 24 * 60 * 60 * 1000; // 24 hours

            return data.token;
        } catch (error) {
            console.error('Failed to get CSRF token:', error);
            throw error;
        }
    }

    /**
     * Clear cached token (for logout or errors)
     */
    clearToken(): void {
        this.csrfToken = null;
        this.tokenExpiry = 0;
    }

    /**
     * Get headers with CSRF token
     */
    async getHeaders(): Promise<Record<string, string>> {
        const token = await this.getToken();
        console.log('CSRF Frontend: Preparing headers with token:', token.substring(0, 20) + '...');
        return {
            'x-csrf-token': token,
            'Content-Type': 'application/json',
        };
    }
}

export const csrfService = new CsrfService();
