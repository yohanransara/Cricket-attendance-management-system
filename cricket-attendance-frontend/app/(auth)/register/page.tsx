'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
    UserPlus,
    ArrowLeft,
    Loader2,
    School,
    IdCard,
    User,
    Mail,
    Lock,
    Phone,
    Calendar
} from 'lucide-react';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const registerSchema = z.object({
    email: z.string()
        .email('Invalid email address')
        .refine(val => val.toLowerCase().endsWith('@tec.rjt.ac.lk'), {
            message: "Only @tec.rjt.ac.lk email addresses are allowed"
        }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    studentId: z.string().min(1, 'Student ID is required'),
    name: z.string().min(1, 'Full name is required'),
    faculty: z.string().min(1, 'Faculty is required'),
    year: z.number().min(1, 'Academic year is required'),
    contactNumber: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            studentId: '',
            name: '',
            faculty: '',
            year: 1,
            contactNumber: '',
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = form;

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            await authAPI.register(data);
            toast.success('Registration successful! Please log in.');
            router.push('/login');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden px-4 py-8 md:py-12">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
                <img src="/cricket-pattern.svg" alt="pattern" className="w-full h-full object-cover" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-foreground/70 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Link>

                <Card className="shadow-2xl border-primary/10">
                    <CardHeader className="text-center space-y-2">
                        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-primary/5 p-3 rounded-full flex items-center justify-center border border-primary/10">
                            <UserPlus className="w-full h-full text-primary" />
                        </div>
                        <CardTitle className="text-2xl md:text-3xl font-bold">Student Registration</CardTitle>
                        <CardDescription>Create your account to start tracking your practice attendance</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary" /> Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter your full name"
                                        {...register('name')}
                                        disabled={isLoading}
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>

                                {/* Student ID */}
                                <div className="space-y-2">
                                    <Label htmlFor="studentId" className="flex items-center gap-2">
                                        <IdCard className="w-4 h-4 text-primary" /> Student ID
                                    </Label>
                                    <Input
                                        id="studentId"
                                        placeholder="e.g. TEC/2020/001"
                                        {...register('studentId')}
                                        disabled={isLoading}
                                        className={errors.studentId ? 'border-destructive' : ''}
                                    />
                                    {errors.studentId && <p className="text-xs text-destructive">{errors.studentId.message}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary" /> University Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your-id@tec.rjt.ac.lk"
                                        {...register('email')}
                                        disabled={isLoading}
                                        className={errors.email ? 'border-destructive' : ''}
                                    />
                                    <div className="flex items-center gap-1.5 px-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                            Strictly @tec.rjt.ac.lk only
                                        </p>
                                    </div>
                                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-primary" /> Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        {...register('password')}
                                        disabled={isLoading}
                                        className={errors.password ? 'border-destructive' : ''}
                                    />
                                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                                </div>

                                {/* Faculty */}
                                <div className="space-y-2">
                                    <Label htmlFor="faculty" className="flex items-center gap-2">
                                        <School className="w-4 h-4 text-primary" /> Faculty
                                    </Label>
                                    <Input
                                        id="faculty"
                                        placeholder="e.g. Technology"
                                        {...register('faculty')}
                                        disabled={isLoading}
                                        className={errors.faculty ? 'border-destructive' : ''}
                                    />
                                    {errors.faculty && <p className="text-xs text-destructive">{errors.faculty.message}</p>}
                                </div>

                                {/* Year */}
                                <div className="space-y-2">
                                    <Label htmlFor="year" className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" /> Academic Year
                                    </Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        {...register('year')}
                                        disabled={isLoading}
                                        className={errors.year ? 'border-destructive' : ''}
                                    />
                                    {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
                                </div>

                                {/* Contact Number */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="contactNumber" className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary" /> Contact Number (Optional)
                                    </Label>
                                    <Input
                                        id="contactNumber"
                                        placeholder="07xxxxxxxx"
                                        {...register('contactNumber')}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Register as Student'
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-center border-t p-6 bg-muted/20">
                        <p className="text-sm text-foreground/70">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Log in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
