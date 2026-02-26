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
import { FileDown, TrendingUp, Users, Calendar as CalendarIcon, Award, Loader2, Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { attendanceAPI, reportAPI } from '@/lib/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { MonthlyAttendanceData, DashboardStats, SessionAttendance, StudentAttendanceRecord } from '@/types';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyAttendanceData[]>([]);

    // Daily Report State
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [dailyReport, setDailyReport] = useState<SessionAttendance | null>(null);
    const [fetchingDaily, setFetchingDaily] = useState(false);

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

    const handleDateSelect = async (date: Date | undefined) => {
        setSelectedDate(date);
        if (!date) {
            setDailyReport(null);
            return;
        }

        setFetchingDaily(true);
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const data = await attendanceAPI.getSessionByDate(formattedDate);
            if (data) {
                setDailyReport(data);
                toast.success(`Loaded attendance for ${formattedDate}`);
            } else {
                setDailyReport(null);
                toast.info(`No practice session found for ${formattedDate}`);
            }
        } catch (error) {
            console.error('Failed to fetch daily report:', error);
            toast.error('Failed to load daily attendance');
        } finally {
            setFetchingDaily(false);
        }
    };

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            const isDaily = !!dailyReport && !!selectedDate;
            const title = isDaily
                ? `Attendance Report - ${format(selectedDate!, 'PPP')}`
                : 'RUSL Cricket Monthly Attendance Report';

            // Add Title
            doc.setFontSize(20);
            doc.setTextColor(10, 31, 68); // Brand color
            doc.text(title, 14, 22);

            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, 14, 30);

            let head, body;

            if (isDaily) {
                head = [['Reg ID', 'Student Name', 'Status']];
                body = dailyReport!.attendance.map((record: StudentAttendanceRecord) => [
                    record.studentRegId,
                    record.studentName,
                    record.isPresent ? 'Present' : 'Absent'
                ]);
            } else {
                head = [['Month', 'Present Count', 'Absent Count']];
                body = monthlyData.map((item: MonthlyAttendanceData) => [
                    item.month,
                    item.present.toString(),
                    item.absent.toString()
                ]);
            }

            autoTable(doc, {
                startY: 40,
                head: head,
                body: body,
                headStyles: { fillColor: [10, 31, 68] },
                alternateRowStyles: { fillColor: [254, 247, 229] },
            });

            const filename = isDaily
                ? `cricket_attendance_${format(selectedDate!, 'yyyy_MM_dd')}.pdf`
                : 'cricket_monthly_summary.pdf';

            doc.save(filename);
            toast.success('PDF report downloaded');
        } catch (error) {
            console.error('PDF export failed:', error);
            toast.error('Failed to generate PDF');
        }
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const isDaily = !!dailyReport && !!selectedDate;
            const sheetName = isDaily ? 'Daily Attendance' : 'Monthly Summary';
            const worksheet = workbook.addWorksheet(sheetName);

            if (isDaily) {
                worksheet.columns = [
                    { header: 'Reg ID', key: 'studentRegId', width: 20 },
                    { header: 'Student Name', key: 'studentName', width: 30 },
                    { header: 'Status', key: 'status', width: 15 }
                ];
                dailyReport!.attendance.forEach((record: StudentAttendanceRecord) => {
                    worksheet.addRow({
                        studentRegId: record.studentRegId,
                        studentName: record.studentName,
                        status: record.isPresent ? 'Present' : 'Absent'
                    });
                });
            } else {
                worksheet.columns = [
                    { header: 'Month', key: 'month', width: 20 },
                    { header: 'Present', key: 'present', width: 15 },
                    { header: 'Absent', key: 'absent', width: 15 }
                ];
                monthlyData.forEach((item: MonthlyAttendanceData) => {
                    worksheet.addRow(item);
                });
            }

            // Stylize Header
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0A1F44' }
            };

            const filename = isDaily
                ? `cricket_attendance_${format(selectedDate!, 'yyyy_MM_dd')}.xlsx`
                : 'cricket_monthly_summary.xlsx';

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, filename);
            toast.success('Excel export downloaded');
        } catch (error) {
            console.error('Excel export failed:', error);
            toast.error('Failed to generate Excel file');
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
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border-2 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-[#0A1F44]">Attendance Reports</h1>
                    <p className="text-muted-foreground mt-1">Analytics and participation trends</p>
                </div>
                <div className="flex items-center gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={`w-[240px] justify-start text-left font-normal border-2 ${!selectedDate && "text-muted-foreground"}`}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Filter by practice date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <div className="h-8 w-px bg-slate-200 mx-2" />

                    <div className="flex gap-2">
                        <Button
                            className="bg-[#0A1F44] hover:bg-[#1a2e5a] text-white"
                            onClick={handleExportPDF}
                            disabled={!monthlyData.length && !dailyReport}
                        >
                            <FileDown className="w-4 h-4 mr-2" /> PDF Report
                        </Button>
                        <Button
                            variant="outline"
                            className="border-2 text-[#F5B301] border-[#F5B301] hover:bg-[#F5B301]/10"
                            onClick={handleExportExcel}
                            disabled={!monthlyData.length && !dailyReport}
                        >
                            <FileDown className="w-4 h-4 mr-2" /> Excel Export
                        </Button>
                    </div>
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

            {/* Daily Report Table Section */}
            {selectedDate && (
                <Card className="border-2 shadow-md overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    Practice Details: {format(selectedDate, 'PPP')}
                                    {dailyReport && <Badge className="bg-green-100 text-green-700 border-green-200">Session Found</Badge>}
                                </CardTitle>
                                <CardDescription>Attendance results for the selected practice day</CardDescription>
                            </div>
                            {fetchingDaily && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {dailyReport ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-bold">Registration ID</TableHead>
                                        <TableHead className="font-bold">Student Name</TableHead>
                                        <TableHead className="text-center font-bold">Attendance Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailyReport.attendance.map((record: StudentAttendanceRecord) => (
                                        <TableRow key={record.studentId} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium text-slate-700">{record.studentRegId}</TableCell>
                                            <TableCell className="font-semibold">{record.studentName}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-center">
                                                    {record.isPresent ? (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center px-3 py-1">
                                                            <CheckCircle className="w-3 h-3" /> Present
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex gap-1 items-center px-3 py-1">
                                                            <XCircle className="w-3 h-3" /> Absent
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-white">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-lg">No session data found for this date.</p>
                                <p className="text-sm">Please select another date or check if attendance was marked.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

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
