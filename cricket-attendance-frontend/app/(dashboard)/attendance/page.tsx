'use client';

import { useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ClipboardCheck, CalendarIcon, Save, Loader2 } from 'lucide-react';
import { studentAPI, attendanceAPI } from '@/lib/api';
import type { Student } from '@/types';

export default function AttendancePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (date) {
            checkExistingSession();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    const fetchStudents = async () => {
        try {
            const data = await studentAPI.getAll();
            setStudents(data);
            // Initialize attendance as all absent by default
            const initialAttendance: Record<number, boolean> = {};
            data.forEach(s => initialAttendance[s.id] = false);
            setAttendance(initialAttendance);
        } catch (error) {
            console.error('Failed to load students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const checkExistingSession = async () => {
        if (!date) return;
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const data = await attendanceAPI.getSessionByDate(formattedDate);
            if (data && data.session) {
                const savedAttendance: Record<number, boolean> = {};
                data.attendance.forEach(record => {
                    savedAttendance[record.studentId] = record.isPresent;
                });
                setAttendance(savedAttendance);
            }
        } catch (error) {
            console.error('Session check failed:', error);
        }
    };

    const toggleAttendance = (studentId: number) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const handleSave = async () => {
        if (!date) return;
        setSaving(true);
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');

            // Step 1: Create or Get Session
            const session = await attendanceAPI.createSession(formattedDate);
            if (!session || !session.id) {
                console.error('Missing session ID:', session);
                throw new Error('Server returned an invalid session. Please check backend logs.');
            }

            // Step 2: Mark Attendance
            const attendanceData = Object.entries(attendance).map(([id, isPresent]) => ({
                studentId: parseInt(id),
                isPresent
            }));

            await attendanceAPI.markAttendance(session.id, attendanceData);
            toast.success('Attendance saved successfully');
        } catch (error: unknown) {
            const message = error instanceof Error && 'response' in error ? (error as { response: { data: { message: string } } }).response?.data?.message : 'Failed to save attendance';
            toast.error(message || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-primary">Mark Attendance</h1>
                <p className="text-muted-foreground">Daily practice session attendance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Date Selection */}
                <Card className="border-2 shadow-md h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            Select Date
                        </CardTitle>
                        <CardDescription>Choose the date of the practice session</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border-2"
                            disabled={(date) => date > new Date()}
                        />
                    </CardContent>
                </Card>

                {/* Student List */}
                <Card className="lg:col-span-2 border-2 shadow-md h-fit overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardCheck className="w-5 h-5 text-primary" />
                                    Attendance Sheet
                                </CardTitle>
                                <CardDescription>
                                    {date ? format(date, 'PPP') : 'Select a date'}
                                </CardDescription>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={saving || !date}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Attendance
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20 text-center">Present</TableHead>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Faculty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10">
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                                                <p className="text-muted-foreground">Loading students...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                            No students registered yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((student) => (
                                        <TableRow
                                            key={student.id}
                                            className={`cursor-pointer hover:bg-muted/50 transition-colors ${attendance[student.id] ? 'bg-primary/5' : ''}`}
                                            onClick={() => toggleAttendance(student.id)}
                                        >
                                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={attendance[student.id]}
                                                    onCheckedChange={() => toggleAttendance(student.id)}
                                                    className="w-6 h-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{student.studentId}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.faculty}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
