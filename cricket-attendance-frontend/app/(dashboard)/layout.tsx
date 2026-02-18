'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from 'sonner';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Protected route - check authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:hidden">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
                        <span className="font-bold text-sm">Cricket RUSL</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </Button>
                </header>

                <main className="flex-1 overflow-auto">
                    <div className="container mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
}
