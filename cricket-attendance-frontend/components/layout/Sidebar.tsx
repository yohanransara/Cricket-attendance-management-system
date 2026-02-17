import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    ClipboardCheck,
    BarChart3,
    LogOut,
    Trophy
} from 'lucide-react';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import type { User } from '@/types';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== 'undefined') {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Failed to parse user from localStorage', e);
        }
    }, []);

    const menuItems = [
        {
            title: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            roles: ['ADMIN', 'COACH', 'SPORTS_OFFICER', 'STUDENT']
        },
        {
            title: 'Students',
            icon: Users,
            href: '/students',
            roles: ['ADMIN', 'COACH', 'SPORTS_OFFICER']
        },
        {
            title: 'Mark Attendance',
            icon: ClipboardCheck,
            href: '/attendance',
            roles: ['ADMIN', 'COACH', 'SPORTS_OFFICER']
        },
        {
            title: 'Reports',
            icon: BarChart3,
            href: '/reports',
            roles: ['ADMIN', 'COACH', 'SPORTS_OFFICER']
        },
    ];

    const filteredItems = menuItems.filter(item =>
        !user || item.roles.includes(user.role as ('ADMIN' | 'COACH' | 'SPORTS_OFFICER' | 'STUDENT'))
    );

    const handleLogout = () => {
        authAPI.logout();
        toast.success('Logged out successfully');
        router.push('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-xl transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:flex'}
            `}>
                {/* Logo & Branding */}
                <div className="p-6 border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 p-1 rounded-lg flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg leading-tight">Cricket</h2>
                            <p className="text-xs text-sidebar-foreground/70">RUSL Attendance</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4 space-y-2">
                    {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-lg border-l-4 border-sidebar-primary'
                                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                                    }
              `}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-sidebar-border">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
