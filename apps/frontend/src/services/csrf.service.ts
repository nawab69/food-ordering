// CSRF Token Management Service

class CsrfService {
    private csrfToken: string | null = null;

    async getCsrfToken(): Promise<string> {
        if (this.csrfToken) {
            return this.csrfToken;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/csrf', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch CSRF token');
            }

            const data = await response.json();
            this.csrfToken = data.token;

            // Store token in localStorage for persistence
            if (this.csrfToken) {
                localStorage.setItem('csrfToken', this.csrfToken);
            }

            return this.csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            throw error;
        }
    }

    async ensureCsrfToken(): Promise<void> {
        const storedToken = localStorage.getItem('csrfToken');
        if (storedToken) {
            this.csrfToken = storedToken;
        } else {
            await this.getCsrfToken();
        }
    }

    clearToken(): void {
        this.csrfToken = null;
        localStorage.removeItem('csrfToken');
    }
}

export const csrfService = new CsrfService();
