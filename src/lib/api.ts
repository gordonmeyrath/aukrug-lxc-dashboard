// API Client for WordPress Integration

const API_BASE_URL = process.env.WP_BASE_URL || '/dashboard/api/wp';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface Report {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    location?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    attachments?: string[];
    created_at: string;
    updated_at: string;
    reporter_name?: string;
    reporter_email?: string;
    assigned_to?: string;
    resolution_notes?: string;
}

export interface Notice {
    id: number;
    title: string;
    content: string;
    excerpt?: string;
    status: 'draft' | 'published' | 'archived';
    priority: 'low' | 'medium' | 'high';
    valid_from?: string;
    valid_until?: string;
    created_at: string;
    updated_at: string;
    author: string;
    categories: string[];
    attachments?: string[];
}

export interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date?: string;
    location?: string;
    organizer?: string;
    contact_info?: string;
    registration_required: boolean;
    max_participants?: number;
    current_participants: number;
    status: 'draft' | 'published' | 'cancelled';
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    display_name: string;
    roles: string[];
    created_at: string;
    last_login?: string;
    status: 'active' | 'inactive' | 'suspended';
}

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    private async request<T>(
        endpoint: string, 
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'API request failed',
                };
            }

            return {
                success: true,
                data,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    // Reports API
    async getReports(params?: { 
        status?: string; 
        category?: string; 
        limit?: number; 
        page?: number; 
    }): Promise<ApiResponse<Report[]>> {
        const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.request<Report[]>(`/reports${queryString}`);
    }

    async getReport(id: number): Promise<ApiResponse<Report>> {
        return this.request<Report>(`/reports/${id}`);
    }

    async createReport(report: Partial<Report>): Promise<ApiResponse<Report>> {
        return this.request<Report>('/reports', {
            method: 'POST',
            body: JSON.stringify(report),
        });
    }

    async updateReport(id: number, report: Partial<Report>): Promise<ApiResponse<Report>> {
        return this.request<Report>(`/reports/${id}`, {
            method: 'PUT',
            body: JSON.stringify(report),
        });
    }

    async deleteReport(id: number): Promise<ApiResponse<void>> {
        return this.request<void>(`/reports/${id}`, {
            method: 'DELETE',
        });
    }

    // Notices API
    async getNotices(params?: { 
        status?: string; 
        limit?: number; 
        page?: number; 
    }): Promise<ApiResponse<Notice[]>> {
        const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.request<Notice[]>(`/notices${queryString}`);
    }

    async getNotice(id: number): Promise<ApiResponse<Notice>> {
        return this.request<Notice>(`/notices/${id}`);
    }

    async createNotice(notice: Partial<Notice>): Promise<ApiResponse<Notice>> {
        return this.request<Notice>('/notices', {
            method: 'POST',
            body: JSON.stringify(notice),
        });
    }

    async updateNotice(id: number, notice: Partial<Notice>): Promise<ApiResponse<Notice>> {
        return this.request<Notice>(`/notices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(notice),
        });
    }

    // Events API
    async getEvents(params?: { 
        status?: string; 
        upcoming?: boolean;
        limit?: number; 
        page?: number; 
    }): Promise<ApiResponse<Event[]>> {
        const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.request<Event[]>(`/events${queryString}`);
    }

    async getEvent(id: number): Promise<ApiResponse<Event>> {
        return this.request<Event>(`/events/${id}`);
    }

    async createEvent(event: Partial<Event>): Promise<ApiResponse<Event>> {
        return this.request<Event>('/events', {
            method: 'POST',
            body: JSON.stringify(event),
        });
    }

    async updateEvent(id: number, event: Partial<Event>): Promise<ApiResponse<Event>> {
        return this.request<Event>(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(event),
        });
    }

    // Users API  
    async getUsers(params?: { 
        role?: string; 
        status?: string;
        limit?: number; 
        page?: number; 
    }): Promise<ApiResponse<User[]>> {
        const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return this.request<User[]>(`/users${queryString}`);
    }

    async getUser(id: number): Promise<ApiResponse<User>> {
        return this.request<User>(`/users/${id}`);
    }

    // Statistics API
    async getStats(): Promise<ApiResponse<{
        reports: {
            total: number;
            pending: number;
            resolved: number;
            by_category: Record<string, number>;
        };
        notices: {
            total: number;
            published: number;
            draft: number;
        };
        events: {
            total: number;
            upcoming: number;
            past: number;
        };
        users: {
            total: number;
            active: number;
            new_this_month: number;
        };
    }>> {
        return this.request('/stats');
    }
}

export const apiClient = new ApiClient();