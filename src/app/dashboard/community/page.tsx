'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, apiClient } from '@/lib/api';

export default function CommunityPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        newThisMonth: 0,
        onlineNow: 0,
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<{
        role?: string;
        status?: string;
        search?: string;
    }>({});

    // Mock data for development
    const mockUsers: User[] = [
        {
            id: 1,
            username: 'admin',
            email: 'admin@aukrug.de',
            display_name: 'Administrator',
            roles: ['administrator'],
            created_at: '2023-01-15T10:00:00Z',
            last_login: '2024-01-15T09:30:00Z',
            status: 'active',
        },
        {
            id: 2,
            username: 'max.mustermann',
            email: 'max@example.com',
            display_name: 'Max Mustermann',
            roles: ['resident'],
            created_at: '2023-03-20T14:15:00Z',
            last_login: '2024-01-14T18:45:00Z',
            status: 'active',
        },
        {
            id: 3,
            username: 'anna.schmidt',
            email: 'anna@example.com',
            display_name: 'Anna Schmidt',
            roles: ['resident', 'volunteer'],
            created_at: '2023-06-10T11:30:00Z',
            last_login: '2024-01-13T16:20:00Z',
            status: 'active',
        },
        {
            id: 4,
            username: 'tourist.user',
            email: 'tourist@example.com',
            display_name: 'Tourist User',
            roles: ['tourist'],
            created_at: '2024-01-10T09:00:00Z',
            last_login: '2024-01-12T12:15:00Z',
            status: 'active',
        },
    ];

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        setLoading(true);
        
        try {
            // Try API call first
            const usersResponse = await apiClient.getUsers(filter);
            
            if (usersResponse.success && usersResponse.data) {
                setUsers(usersResponse.data);
                calculateStats(usersResponse.data);
            } else {
                // Fallback to mock data
                console.warn('API call failed, using mock data:', usersResponse.error);
                setUsers(mockUsers);
                calculateStats(mockUsers);
            }
        } catch (err) {
            console.warn('API error, using mock data:', err);
            setUsers(mockUsers);
            calculateStats(mockUsers);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (userData: User[]) => {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        setStats({
            totalUsers: userData.length,
            activeUsers: userData.filter(u => u.status === 'active').length,
            newThisMonth: userData.filter(u => new Date(u.created_at) >= thisMonth).length,
            onlineNow: userData.filter(u => {
                if (!u.last_login) return false;
                const lastLogin = new Date(u.last_login);
                const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
                return lastLogin >= thirtyMinutesAgo;
            }).length,
        });
    };

    const filteredUsers = users.filter(user => {
        if (filter.role && !user.roles.includes(filter.role)) return false;
        if (filter.status && user.status !== filter.status) return false;
        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            return (
                user.display_name.toLowerCase().includes(searchTerm) ||
                user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        }
        return true;
    });

    const roleColors: Record<string, string> = {
        administrator: 'danger',
        moderator: 'warning',
        resident: 'primary',
        volunteer: 'info',
        tourist: 'success',
    };

    const getRoleLabel = (role: string): string => {
        const labels: Record<string, string> = {
            administrator: 'Administrator',
            moderator: 'Moderator',
            resident: 'Einwohner',
            volunteer: 'Freiwilliger',
            tourist: 'Tourist',
        };
        return labels[role] || role;
    };

    return (
        <div className="container-fluid py-4">
            {/* Page Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="h3 mb-0 text-gray-800">
                        <i className="fas fa-users me-2"></i>
                        Gemeinschaftsübersicht
                    </h1>
                    <p className="text-muted">Verwalte Benutzer und Gemeinschaftsaktivitäten</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Gesamte Benutzer
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.totalUsers}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-users fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Aktive Benutzer
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.activeUsers}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-user-check fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Neu diesen Monat
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.newThisMonth}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-user-plus fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Online jetzt
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.onlineNow}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-circle fa-2x text-success"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3">
                            <label className="form-label">Rolle</label>
                            <select 
                                className="form-select"
                                value={filter.role || ''}
                                onChange={(e) => setFilter({...filter, role: e.target.value || undefined})}
                            >
                                <option value="">Alle Rollen</option>
                                <option value="administrator">Administrator</option>
                                <option value="resident">Einwohner</option>
                                <option value="volunteer">Freiwilliger</option>
                                <option value="tourist">Tourist</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Status</label>
                            <select 
                                className="form-select"
                                value={filter.status || ''}
                                onChange={(e) => setFilter({...filter, status: e.target.value || undefined})}
                            >
                                <option value="">Alle Status</option>
                                <option value="active">Aktiv</option>
                                <option value="inactive">Inaktiv</option>
                                <option value="suspended">Gesperrt</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Suche</label>
                            <div className="input-group">
                                <input 
                                    type="text"
                                    className="form-control"
                                    placeholder="Suche nach Name, Benutzername oder E-Mail..."
                                    value={filter.search || ''}
                                    onChange={(e) => setFilter({...filter, search: e.target.value || undefined})}
                                />
                                <button className="btn btn-outline-secondary" type="button">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card shadow">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">
                        Benutzer ({filteredUsers.length})
                    </h6>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Laden...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Benutzer</th>
                                        <th>Rollen</th>
                                        <th>Status</th>
                                        <th>Registriert</th>
                                        <th>Letzter Login</th>
                                        <th>Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        className="rounded-circle me-3"
                                                        src={`https://via.placeholder.com/40x40/007bff/ffffff?text=${user.display_name.charAt(0)}`}
                                                        alt={user.display_name}
                                                        width="40"
                                                        height="40"
                                                    />
                                                    <div>
                                                        <div className="fw-bold">{user.display_name}</div>
                                                        <div className="text-muted small">@{user.username}</div>
                                                        <div className="text-muted small">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {user.roles.map((role) => (
                                                    <span 
                                                        key={role} 
                                                        className={`badge bg-${roleColors[role] || 'secondary'} me-1`}
                                                    >
                                                        {getRoleLabel(role)}
                                                    </span>
                                                ))}
                                            </td>
                                            <td>
                                                <span className={`badge bg-${
                                                    user.status === 'active' ? 'success' :
                                                    user.status === 'inactive' ? 'secondary' :
                                                    'danger'
                                                }`}>
                                                    {user.status === 'active' ? 'Aktiv' :
                                                     user.status === 'inactive' ? 'Inaktiv' :
                                                     'Gesperrt'}
                                                </span>
                                            </td>
                                            <td>
                                                <small>
                                                    {new Date(user.created_at).toLocaleDateString('de-DE')}
                                                </small>
                                            </td>
                                            <td>
                                                <small>
                                                    {user.last_login 
                                                        ? new Date(user.last_login).toLocaleDateString('de-DE')
                                                        : 'Nie'
                                                    }
                                                </small>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <Link 
                                                        href={`/dashboard/community/users/${user.id}`}
                                                        className="btn btn-outline-primary"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                    <Link 
                                                        href={`/dashboard/community/users/${user.id}/edit`}
                                                        className="btn btn-outline-secondary"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}