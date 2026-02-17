'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { studentAPI } from '@/lib/api';
import type { Student } from '@/types';

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        studentId: '',
        name: '',
        faculty: '',
        year: '2024',
        contactNumber: '',
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const data = await studentAPI.getAll();
            setStudents(data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (value: string) => {
        setFormData({ ...formData, year: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStudent) {
                await studentAPI.update(editingStudent.id, {
                    ...formData,
                    year: parseInt(formData.year),
                });
                toast.success('Student updated successfully');
            } else {
                await studentAPI.create({
                    ...formData,
                    year: parseInt(formData.year),
                });
                toast.success('Student added successfully');
            }
            setIsAddDialogOpen(false);
            setEditingStudent(null);
            resetForm();
            fetchStudents();
        } catch (error: unknown) {
            const message = error instanceof Error && 'response' in error ? (error as { response: { data: { message: string } } }).response?.data?.message : 'Failed to save student';
            toast.error(message || 'Failed to save student');
        }
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            studentId: student.studentId,
            name: student.name,
            faculty: student.faculty,
            year: student.year.toString(),
            contactNumber: student.contactNumber || '',
        });
        setIsAddDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this student?')) {
            try {
                await studentAPI.delete(id);
                toast.success('Student deleted successfully');
                fetchStudents();
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete student');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            studentId: '',
            name: '',
            faculty: '',
            year: '2024',
            contactNumber: '',
        });
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Student Management</h1>
                    <p className="text-muted-foreground">Manage cricket team players</p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) {
                        setEditingStudent(null);
                        resetForm();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" /> Add Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                            <DialogDescription>
                                {editingStudent ? 'Update the details of the student.' : 'Enter the details of the new cricket player.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="studentId">Student ID</Label>
                                <Input id="studentId" value={formData.studentId} onChange={handleInputChange} placeholder="TG/2021/045" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="faculty">Faculty</Label>
                                    <Input id="faculty" value={formData.faculty} onChange={handleInputChange} placeholder="FOT" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Select value={formData.year} onValueChange={handleSelectChange}>
                                        <SelectTrigger id="year">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2020">2020</SelectItem>
                                            <SelectItem value="2021">2021</SelectItem>
                                            <SelectItem value="2022">2022</SelectItem>
                                            <SelectItem value="2023">2023</SelectItem>
                                            <SelectItem value="2024">2024</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactNumber">Contact Number</Label>
                                <Input id="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="07XXXXXXXX" />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full">
                                    {editingStudent ? 'Update Student' : 'Save Student'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-2 bg-card p-4 rounded-lg border-2 border-border shadow-sm">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Search by name or ID..."
                    className="max-w-md border-none focus-visible:ring-0 shadow-none bg-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Student Table */}
            <div className="bg-card rounded-lg border-2 border-border shadow-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-bold">Student ID</TableHead>
                            <TableHead className="font-bold">Name</TableHead>
                            <TableHead className="font-bold">Faculty</TableHead>
                            <TableHead className="font-bold">Year</TableHead>
                            <TableHead className="font-bold">Contact</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <p className="text-muted-foreground">Loading players...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-lg">
                                    No students found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student) => (
                                <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">{student.studentId}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.faculty}</TableCell>
                                    <TableCell>{student.year}</TableCell>
                                    <TableCell>{student.contactNumber || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleEdit(student)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(student.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
