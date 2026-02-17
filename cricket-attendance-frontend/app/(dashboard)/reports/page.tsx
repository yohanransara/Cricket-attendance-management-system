'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { reportAPI } from '@/lib/api';
import { FileDown, TrendingUp, Users, Calendar, Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MonthlyAttendanceData, DashboardStats } from '@/types';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyAttendanceData[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsData, monthly] = await Promise.all([
                reportAPI.getDashboardStats(),
                reportAPI.getMonthlyData(new Date().getFullYear(), new Date().getMonth() + 1)
            ]);
            setStats(statsData);
            setMonthlyData(monthly);
        } catch (error) {
            console.error('Failed to load reports:', error);
            toast.error('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0A1F44', '#F5B301', '#E2E8F0'];

    const pieData = stats ? [
        { name: 'Average Attendance', value: stats.averageAttendance },
        { name: 'Absence Rate', value: 100 - stats.averageAttendance }
    ] : [];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground text-lg">Generating reports...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Attendance Reports</h1>
                    <p className="text-muted-foreground">Analytics and participation trends</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="border-2">
                        <FileDown className="w-4 h-4 mr-2" /> PDF Report
                    </Button>
                    <Button variant="outline" className="border-2">
                        <FileDown className="w-4 h-4 mr-2" /> Excel Export
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center justify-between">
                            Total Practice Days
                            <Calendar className="w-4 h-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalPracticeDays || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Scheduled sessions</p>
                    </CardContent>
                </Card>
                <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center justify-between">
                            Current Players
                            <Users className="w-4 h-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalPlayers || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registered students</p>
                    </CardContent>
                </Card>
                <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center justify-between">
                            Avg. Attendance
                            <TrendingUp className="w-4 h-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.averageAttendance.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Across all sessions</p>
                    </CardContent>
                </Card>
                <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center justify-between">
                            Top Attendee
                            <Award className="w-4 h-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">{stats?.topAttendee?.name || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stats?.topAttendee?.attendancePercentage.toFixed(1)}% attendance</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Bar Chart */}
                <Card className="border-2 shadow-md">
                    <CardHeader>
                        <CardTitle>Monthly Practice Summary</CardTitle>
                        <CardDescription>Number of present vs absent players</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                                />
                                <Legend />
                                <Bar dataKey="present" name="Present" fill="#0A1F44" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="absent" name="Absent" fill="#F5B301" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Attendance Percentage Pie Chart */}
                <Card className="border-2 shadow-md">
                    <CardHeader>
                        <CardTitle>Attendance Distribution</CardTitle>
                        <CardDescription>Overall participation vs absence</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
