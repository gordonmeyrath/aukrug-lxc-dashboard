'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
    title: string;
    href: string;
    icon: string;
    badge?: string;
    children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: 'fas fa-tachometer-alt',
    },
    {
        title: 'Berichte',
        href: '/dashboard/reports',
        icon: 'fas fa-clipboard-list',
        badge: '8',
        children: [
            {
                title: 'Alle Berichte',
                href: '/dashboard/reports',
                icon: 'fas fa-list',
            },
            {
                title: 'Neuer Bericht',
                href: '/dashboard/reports/new',
                icon: 'fas fa-plus',
            },
            {
                title: 'Offene Berichte',
                href: '/dashboard/reports/pending',
                icon: 'fas fa-exclamation-circle',
            },
        ],
    },
    {
        title: 'Bekanntmachungen',
        href: '/dashboard/notices',
        icon: 'fas fa-bullhorn',
    },
    {
        title: 'Veranstaltungen',
        href: '/dashboard/events',
        icon: 'fas fa-calendar-alt',
    },
    {
        title: 'Downloads',
        href: '/dashboard/downloads',
        icon: 'fas fa-download',
    },
    {
        title: 'Gemeinschaft',
        href: '/dashboard/community',
        icon: 'fas fa-users',
        children: [
            {
                title: 'Übersicht',
                href: '/dashboard/community',
                icon: 'fas fa-users',
            },
            {
                title: 'Benutzer',
                href: '/dashboard/community/users',
                icon: 'fas fa-user',
            },
        ],
    },
    {
        title: 'Einstellungen',
        href: '/dashboard/settings',
        icon: 'fas fa-cog',
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard' && pathname === '/dashboard') {
            return true;
        }
        return pathname?.startsWith(href) && href !== '/dashboard';
    };

    const renderSidebarItem = (item: SidebarItem, isChild = false) => {
        const active = isActive(item.href);
        const hasChildren = item.children && item.children.length > 0;

        return (
            <li key={item.href} className={`nav-item ${hasChildren ? 'dropdown' : ''}`}>
                {hasChildren ? (
                    <>
                        <a
                            className={`nav-link ${
                                active ? 'active' : ''
                            } dropdown-toggle d-flex align-items-center`}
                            href="#"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <i className={`${item.icon} me-2`}></i>
                            <span>{item.title}</span>
                            {item.badge && (
                                <span className="badge bg-primary ms-auto">{item.badge}</span>
                            )}
                        </a>
                        <ul className="dropdown-menu">
                            {item.children.map((child) => (
                                <li key={child.href}>
                                    <Link
                                        href={child.href}
                                        className={`dropdown-item d-flex align-items-center ${
                                            isActive(child.href) ? 'active' : ''
                                        }`}
                                    >
                                        <i className={`${child.icon} me-2`}></i>
                                        <span>{child.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <Link
                        href={item.href}
                        className={`nav-link d-flex align-items-center ${
                            active ? 'active' : ''
                        } ${isChild ? 'ms-3' : ''}`}
                    >
                        <i className={`${item.icon} me-2`}></i>
                        <span>{item.title}</span>
                        {item.badge && (
                            <span className="badge bg-primary ms-auto">{item.badge}</span>
                        )}
                    </Link>
                )}
            </li>
        );
    };

    return (
        <div className="navbar-nav bg-dark sidebar sidebar-dark accordion" id="accordionSidebar">
            {/* Sidebar - Brand */}
            <Link
                className="sidebar-brand d-flex align-items-center justify-content-center"
                href="/dashboard"
            >
                <div className="sidebar-brand-icon rotate-n-15">
                    <i className="fas fa-leaf"></i>
                </div>
                <div className="sidebar-brand-text mx-3">
                    Aukrug
                    <sup>Admin</sup>
                </div>
            </Link>

            {/* Divider */}
            <hr className="sidebar-divider my-0" />

            {/* Nav Items */}
            <ul className="navbar-nav">
                {sidebarItems.map((item) => renderSidebarItem(item))}
            </ul>

            {/* Divider */}
            <hr className="sidebar-divider d-none d-md-block" />

            {/* Sidebar Toggler */}
            <div className="text-center d-none d-md-inline">
                <button className="rounded-circle border-0" id="sidebarToggle"></button>
            </div>
        </div>
    );
}