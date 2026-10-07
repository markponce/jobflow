import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    title?: string;
    description?: string;
}>) {
    const { name, tagline } = usePage().props;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-4 sm:p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex flex-col items-center gap-2 self-center font-medium"
                >
                    <img
                        src="/JobFlow%20Logo.png"
                        alt={name}
                        className="w-40 object-contain"
                    />
                    <span className="text-xs text-muted-foreground">
                        {tagline}
                    </span>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-card">
                        <CardHeader className="px-4 pt-6 pb-0 text-center sm:px-10 sm:pt-8">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 py-6 sm:px-10 sm:py-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
