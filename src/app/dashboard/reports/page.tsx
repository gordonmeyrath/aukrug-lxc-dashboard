'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Report, apiClient } from '@/lib/api';

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<{
        status?: string;
        category?: string;
        search?: string;
    }>({});

    const statusColors: Record<string, string> = {
        pending: 'warning',
        in_progress: 'info', 
        resolved: 'success',
        closed: 'secondary',
    };

    const priorityColors: Record<string, string> = {
        low: 'success',
        medium: 'warning',
        high: 'danger',
        critical: 'dark',
    };

    // Mock data for development
    const mockReports: Report[] = [
        {
            id: 1,
            title: 'Schlagloch in der Hauptstraße',
            description: 'Großes Schlagloch vor Haus Nr. 15 in der Hauptstraße. Gefährlich für Radfahrer.',
            status: 'pending',
            priority: 'high',
            category: 'Straßenschäden',
            location: 'Hauptstraße 15, Aukrug',
            coordinates: { lat: 54.1234, lng: 9.5678 },
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
            reporter_name: 'Max Mustermann',
            reporter_email: 'max@example.com',
        },
        {
            id: 2,
            title: 'Defekte Straßenlaterne',
            description: 'Straßenlaterne am Sportplatz ist seit 3 Tagen defekt.',
            status: 'in_progress',
            priority: 'medium',
            category: 'Beleuchtung',
            location: 'Am Sportplatz, Aukrug',
            created_at: '2024-01-14T16:45:00Z',
            updated_at: '2024-01-15T09:15:00Z',
            reporter_name: 'Anna Schmidt',
            reporter_email: 'anna@example.com',
            assigned_to: 'Stadtwerke Team',
        },
        {
            id: 3,
            title: 'Überfüllter Mülleimer',
            description: 'Mülleimer am Bushaltestelle ist überfüllt und riecht unangenehm.',
            status: 'resolved',
            priority: 'low',
            category: 'Sauberkeit',
            location: 'Bushaltestelle Dorfstraße',
            created_at: '2024-01-13T14:20:00Z',
            updated_at: '2024-01-14T11:30:00Z',
            reporter_name: 'Klaus Weber',
            reporter_email: 'klaus@example.com',
            assigned_to: 'Reinigungsservice',
            resolution_notes: 'Mülleimer geleert und gereinigt.',
        },
    ];

    useEffect(() => {
        loadReports();
    }, [filter]);

    const loadReports = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Try API call first
            const response = await apiClient.getReports(filter);
            
            if (response.success && response.data) {
                setReports(response.data);
            } else {
                // Fallback to mock data
                console.warn('API call failed, using mock data:', response.error);
                setReports(mockReports);
            }
        } catch (err) {
            console.warn('API error, using mock data:', err);
            setReports(mockReports);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(report => {
        if (filter.status && report.status !== filter.status) return false;
        if (filter.category && report.category !== filter.category) return false;
        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            return (
                report.title.toLowerCase().includes(searchTerm) ||
                report.description.toLowerCase().includes(searchTerm) ||
                report.category.toLowerCase().includes(searchTerm)
            );
        }
        return true;
    });

    const categories = [...new Set(reports.map(r => r.category))];

    return (
        <div className="container-fluid py-4">
            {/* Page Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="h3 mb-0 text-gray-800">
                                <i className="fas fa-clipboard-list me-2"></i>
                                Berichte verwalten
                            </h1>
                            <p className="text-muted">Übersicht aller eingegangenen Berichte</p>
                        </div>
                        <Link href="/dashboard/reports/new" className="btn btn-primary">
                            <i className="fas fa-plus me-2"></i>
                            Neuer Bericht
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3">
                            <label className="form-label">Status</label>
                            <select 
                                className="form-select"
                                value={filter.status || ''}
                                onChange={(e) => setFilter({...filter, status: e.target.value || undefined})}
                            >
                                <option value="">Alle Status</option>
                                <option value="pending">Offen</option>
                                <option value="in_progress">In Bearbeitung</option>
                                <option value="resolved">Erledigt</option>
                                <option value="closed">Geschlossen</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Kategorie</label>
                            <select 
                                className="form-select"
                                value={filter.category || ''}
                                onChange={(e) => setFilter({...filter, category: e.target.value || undefined})}
                            >
                                <option value="">Alle Kategorien</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Suche</label>
                            <div className="input-group">
                                <input 
                                    type="text"
                                    className="form-control"
                                    placeholder="Suche nach Titel, Beschreibung oder Kategorie..."
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

            {/* Reports Table */}
            <div className="card shadow">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">
                        Berichte ({filteredReports.length})
                    </h6>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Laden...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Titel</th>
                                        <th>Kategorie</th>
                                        <th>Status</th>
                                        <th>Priorität</th>
                                        <th>Ort</th>
                                        <th>Erstellt</th>
                                        <th>Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.map((report) => (
                                        <tr key={report.id}>
                                            <td>#{report.id}</td>
                                            <td>
                                                <Link 
                                                    href={`/dashboard/reports/${report.id}`}
                                                    className="text-decoration-none fw-bold"
                                                >
                                                    {report.title}
                                                </Link>
                                                <br />
                                                <small className="text-muted">
                                                    {report.description.substring(0, 80)}...
                                                </small>
                                            </td>
                                            <td>
                                                <span className="badge bg-secondary">
                                                    {report.category}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${statusColors[report.status]}`}>
                                                    {report.status === 'pending' ? 'Offen' :
                                                     report.status === 'in_progress' ? 'In Bearbeitung' :
                                                     report.status === 'resolved' ? 'Erledigt' :
                                                     'Geschlossen'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${priorityColors[report.priority]}`}>
                                                    {report.priority === 'low' ? 'Niedrig' :
                                                     report.priority === 'medium' ? 'Mittel' :
                                                     report.priority === 'high' ? 'Hoch' :
                                                     'Kritisch'}
                                                </span>
                                            </td>
                                            <td>{report.location || '-'}</td>
                                            <td>
                                                <small>
                                                    {new Date(report.created_at).toLocaleDateString('de-DE')}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <Link 
                                                        href={`/dashboard/reports/${report.id}`}
                                                        className="btn btn-outline-primary"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                    <Link 
                                                        href={`/dashboard/reports/${report.id}/edit`}
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