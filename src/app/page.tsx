'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    totalNotices: number;
    totalEvents: number;
    totalDownloads: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
        totalNotices: 0,
        totalEvents: 0,
        totalDownloads: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading stats
        setTimeout(() => {
            setStats({
                totalReports: 24,
                pendingReports: 8,
                resolvedReports: 16,
                totalNotices: 12,
                totalEvents: 6,
                totalDownloads: 45,
            });
            setLoading(false);
        }, 1000);
    }, []);

    const statCards = [
        {
            title: 'Gesamte Berichte',
            value: stats.totalReports,
            icon: 'fas fa-clipboard-list',
            color: 'primary',
            link: '/reports',
        },
        {
            title: 'Offene Berichte',
            value: stats.pendingReports,
            icon: 'fas fa-exclamation-circle',
            color: 'warning',
            link: '/reports?status=pending',
        },
        {
            title: 'Erledigte Berichte',
            value: stats.resolvedReports,
            icon: 'fas fa-check-circle',
            color: 'success',
            link: '/reports?status=resolved',
        },
        {
            title: 'Bekanntmachungen',
            value: stats.totalNotices,
            icon: 'fas fa-bullhorn',
            color: 'info',
            link: '/notices',
        },
        {
            title: 'Veranstaltungen',
            value: stats.totalEvents,
            icon: 'fas fa-calendar-alt',
            color: 'secondary',
            link: '/events',
        },
        {
            title: 'Downloads',
            value: stats.totalDownloads,
            icon: 'fas fa-download',
            color: 'dark',
            link: '/downloads',
        },
    ];

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="h3 mb-0 text-gray-800">
                        <i className="fas fa-tachometer-alt me-2"></i>
                        Dashboard
                    </h1>
                    <p className="text-muted">Willkommen im Aukrug Verwaltungsdashboard</p>
                </div>
            </div>

            {loading ? (
                <div className="row">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="col-xl-2 col-md-4 col-sm-6 mb-4">
                            <div className="card border-left-primary shadow h-100 py-2">
                                <div className="card-body">
                                    <div className="d-flex justify-content-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Laden...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="row">
                    {statCards.map((card, index) => (
                        <div key={index} className="col-xl-2 col-md-4 col-sm-6 mb-4">
                            <Link href={card.link} className="text-decoration-none">
                                <div className={`card border-left-${card.color} shadow h-100 py-2`}>
                                    <div className="card-body">
                                        <div className="row no-gutters align-items-center">
                                            <div className="col mr-2">
                                                <div className={`text-xs font-weight-bold text-${card.color} text-uppercase mb-1`}>
                                                    {card.title}
                                                </div>
                                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                                    {card.value}
                                                </div>
                                            </div>
                                            <div className="col-auto">
                                                <i className={`${card.icon} fa-2x text-gray-300`}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-bolt me-2"></i>
                                Schnellaktionen
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <Link href="/reports/new" className="btn btn-primary btn-sm w-100">
                                        <i className="fas fa-plus me-2"></i>
                                        Neuer Bericht
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link href="/notices/new" className="btn btn-info btn-sm w-100">
                                        <i className="fas fa-bullhorn me-2"></i>
                                        Neue Bekanntmachung
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link href="/events/new" className="btn btn-secondary btn-sm w-100">
                                        <i className="fas fa-calendar-plus me-2"></i>
                                        Neue Veranstaltung
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link href="/settings" className="btn btn-outline-secondary btn-sm w-100">
                                        <i className="fas fa-cog me-2"></i>
                                        Einstellungen
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}