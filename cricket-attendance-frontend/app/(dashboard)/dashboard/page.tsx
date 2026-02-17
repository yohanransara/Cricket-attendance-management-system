'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, TrendingUp, Trophy, Award, Clock, LucideIcon } from 'lucide-react';
import { reportAPI, attendanceAPI } from '@/lib/api';
import type { DashboardStats, StudentStats, PracticeAttendance, User } from '@/types';

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
    const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
    const [recentAttendance, setRecentAttendance] = useState<PracticeAttendance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== 'undefined') {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to parse user session:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                if (user.role === 'STUDENT') {
                    const [stats, recent] = await Promise.all([
                        reportAPI.getPersonalStats(),
                        attendanceAPI.getRecentAttendance()
                    ]);
                    setStudentStats(stats);
                    setRecentAttendance(recent);
                } else {
                    const stats = await reportAPI.getDashboardStats();
                    setAdminStats(stats);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                // Even on error, we should stop loading to show whatever we have or an error state
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        } else {
            // If we are here and still loading but no user, something is wrong
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (user?.role === 'STUDENT') {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-primary mb-2">My Performance</h1>
                    <p className="text-muted-foreground">Keep track of your practice attendance and progress</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Attendance Rate" value={`${studentStats?.attendancePercentage?.toFixed(1) ?? '0.0'}%`} icon={TrendingUp} color="text-green-600" bgColor="bg-green-100" />
                    <StatCard title="Sessions Attended" value={studentStats?.sessionsAttended ?? 0} icon={Award} color="text-primary" bgColor="bg-primary/10" />
                    <StatCard title="Total Sessions" value={studentStats?.totalSessions ?? 0} icon={Calendar} color="text-accent" bgColor="bg-accent/10" />
                    <StatCard title="Last Session" value={studentStats?.recentAttendance?.[0]?.isPresent ? 'Present' : 'Absent'} subtitle={studentStats?.recentAttendance?.[0]?.date ?? 'No sessions yet'} icon={Clock} color="text-amber-600" bgColor="bg-amber-100" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-2">
                        <CardHeader><CardTitle>My Recent Attendance</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {studentStats?.recentAttendance?.map((record, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <span className="font-medium">{record.date}</span>
                                        <span className={`text-sm font-bold ${record.isPresent ? 'text-green-600' : 'text-red-600'}`}>
                                            {record.isPresent ? 'PRESENT' : 'ABSENT'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardHeader><CardTitle>Who Attended Recent Practices</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentAttendance.map((session, i) => (
                                    <div key={i} className="border-b pb-3 last:border-0">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-primary">{session.date}</span>
                                            <span className="text-xs text-muted-foreground">{session.presentStudentNames.length} attended</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {session.presentStudentNames.map((name, j) => (
                                                <span key={j} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">{name}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    const adminStatCards = [
        { title: 'Total Practice Days', value: adminStats?.totalPracticeDays ?? 0, icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10' },
        { title: 'Total Players', value: adminStats?.totalPlayers ?? 0, icon: Users, color: 'text-accent', bgColor: 'bg-accent/10' },
        { title: 'Average Attendance', value: `${adminStats?.averageAttendance?.toFixed(1) ?? '0.0'}%`, icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100' },
        { title: 'Top Attendee', value: adminStats?.topAttendee?.name ?? 'N/A', subtitle: adminStats?.topAttendee?.attendancePercentage ? `${adminStats.topAttendee.attendancePercentage.toFixed(1)}%` : '', icon: Trophy, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome to the Cricket Practice Attendance Management System</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminStatCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <Card className="border-2">
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ActionCard href="/students" icon={Users} title="Manage Students" desc="Add, edit, or remove players" />
                    <ActionCard href="/attendance" icon={Calendar} title="Mark Attendance" desc="Record today's practice session" color="accent" />
                    <ActionCard href="/reports" icon={TrendingUp} title="View Reports" desc="Generate attendance reports" color="green" />
                </CardContent>
            </Card>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    subtitle?: string;
}

function StatCard({ title, value, icon: Icon, color, bgColor, subtitle }: StatCardProps) {
    return (
        <Card className="hover:shadow-lg transition-all duration-200 border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`p-2 rounded-lg ${bgColor}`}><Icon className={`w-5 h-5 ${color}`} /></div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-foreground">{value}</div>
                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </CardContent>
        </Card>
    );
}

interface ActionCardProps {
    href: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    color?: 'primary' | 'accent' | 'green';
}

function ActionCard({ href, icon: Icon, title, desc, color = 'primary' }: ActionCardProps) {
    const variants: Record<string, string> = {
        primary: 'bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/40 text-primary',
        accent: 'bg-accent/5 hover:bg-accent/10 border-accent/20 hover:border-accent/40 text-accent',
        green: 'bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-400 text-green-600',
    };
    return (
        <a href={href} className={`p-6 rounded-lg border-2 transition-all duration-200 group ${variants[color]}`}>
            <Icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
        </a>
    );
}
