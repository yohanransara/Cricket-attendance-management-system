'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/types';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    // Check if already logged in
    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            if (token && userStr && userStr !== 'undefined') {
                JSON.parse(userStr);
                router.push('/dashboard');
            }
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }, [router]);

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await authAPI.login(data);
            const user: User = {
                id: response.id,
                email: response.email,
                role: response.role
            };

            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(user));
            toast.success('Login successful!');

            router.push('/dashboard');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/cricket-pattern.svg')] opacity-5"></div>

            <div className="w-full max-w-md relative z-10">
                {/* University Logo & Branding */}
                <div className="text-center mb-6 md:mb-8">
                    <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 bg-white/10 p-2 rounded-full flex items-center justify-center border-2 border-primary/20">
                        <img src="/logo.png" alt="RUSL Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary mb-2">
                        Rajarata University of Sri Lanka
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Cricket Practice Attendance System
                    </p>
                </div>

                {/* Login Card with Glassmorphism */}
                <Card className="backdrop-blur-lg bg-card/80 shadow-2xl border-2">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@rusl.lk"
                                    {...register('email')}
                                    className="h-11"
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('password')}
                                    className="h-11"
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02]"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-6 p-3 bg-accent/10 rounded-lg border border-accent/20">
                            <p className="text-xs text-center text-muted-foreground">
                                <strong>Demo:</strong> admin@rusl.lk / admin123
                            </p>
                        </div>
                    </CardContent>
                    <div className="p-6 border-t bg-muted/20 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Are you a student?</p>
                        <Button
                            variant="outline"
                            className="w-full text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-300"
                            onClick={() => router.push('/register')}
                        >
                            Create Student Account
                        </Button>
                    </div>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    © 2026 Rajarata University of Sri Lanka
                </p>
            </div>
        </div>
    );
}
