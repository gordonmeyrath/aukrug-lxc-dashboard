'use client';

import { useState } from 'react';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const notifications = [
        {
            id: 1,
            title: 'Neuer Bericht eingegangen',
            message: 'Straßenschaden in der Hauptstraße gemeldet',
            time: '2 Min',
            read: false,
        },
        {
            id: 2,
            title: 'Bekanntmachung veröffentlicht',
            message: 'Gemeinderatssitzung für nächste Woche geplant',
            time: '1 Std',
            read: true,
        },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            {/* Sidebar Toggle (Topbar) */}
            <button
                id="sidebarToggleTop"
                className="btn btn-link d-md-none rounded-circle mr-3"
            >
                <i className="fa fa-bars"></i>
            </button>

            {/* Topbar Search */}
            <form className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control bg-light border-0 small"
                        placeholder="Suchen nach..."
                        aria-label="Search"
                        aria-describedby="basic-addon2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="input-group-append">
                        <button className="btn btn-primary" type="button">
                            <i className="fas fa-search fa-sm"></i>
                        </button>
                    </div>
                </div>
            </form>

            {/* Topbar Navbar */}
            <ul className="navbar-nav ml-auto">
                {/* Nav Item - Search Dropdown (Visible Only XS) */}
                <li className="nav-item dropdown no-arrow d-sm-none">
                    <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="searchDropdown"
                        role="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <i className="fas fa-search fa-fw"></i>
                    </a>
                    <div
                        className="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in"
                        aria-labelledby="searchDropdown"
                    >
                        <form className="form-inline mr-auto w-100 navbar-search">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control bg-light border-0 small"
                                    placeholder="Suchen nach..."
                                    aria-label="Search"
                                    aria-describedby="basic-addon2"
                                />
                                <div className="input-group-append">
                                    <button className="btn btn-primary" type="button">
                                        <i className="fas fa-search fa-sm"></i>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </li>

                {/* Nav Item - Alerts */}
                <li className="nav-item dropdown no-arrow mx-1 position-relative">
                    <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="alertsDropdown"
                        role="button"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <i className="fas fa-bell fa-fw"></i>
                        {unreadCount > 0 && (
                            <span className="badge badge-danger badge-counter position-absolute top-0 start-100 translate-middle">
                                {unreadCount}
                            </span>
                        )}
                    </a>
                    {showNotifications && (
                        <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in show">
                            <h6 className="dropdown-header">
                                Benachrichtigungen
                            </h6>
                            {notifications.map((notification) => (
                                <a
                                    key={notification.id}
                                    className={`dropdown-item d-flex align-items-center ${
                                        !notification.read ? 'bg-light' : ''
                                    }`}
                                    href="#"
                                >
                                    <div className="mr-3">
                                        <div className="icon-circle bg-primary">
                                            <i className="fas fa-bell text-white"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="small text-gray-500">{notification.time}</div>
                                        <span className="font-weight-bold">{notification.title}</span>
                                        <div className="small">{notification.message}</div>
                                    </div>
                                </a>
                            ))}
                            <a
                                className="dropdown-item text-center small text-gray-500"
                                href="#"
                            >
                                Alle Benachrichtigungen anzeigen
                            </a>
                        </div>
                    )}
                </li>

                {/* Nav Item - User Information */}
                <li className="nav-item dropdown no-arrow">
                    <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="userDropdown"
                        role="button"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <span className="mr-2 d-none d-lg-inline text-gray-600 small">
                            Admin Benutzer
                        </span>
                        <img
                            className="img-profile rounded-circle"
                            src="https://via.placeholder.com/60x60/007bff/ffffff?text=A"
                            alt="Profile"
                            width="32"
                            height="32"
                        />
                    </a>
                    {showUserMenu && (
                        <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in show">
                            <a className="dropdown-item" href="#">
                                <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                                Profil
                            </a>
                            <a className="dropdown-item" href="#">
                                <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                                Einstellungen
                            </a>
                            <a className="dropdown-item" href="#">
                                <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                                Aktivitätsprotokoll
                            </a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" href="#" data-toggle="modal" data-target="#logoutModal">
                                <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                                Abmelden
                            </a>
                        </div>
                    )}
                </li>
            </ul>
        </nav>
    );
}