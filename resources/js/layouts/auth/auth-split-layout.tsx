import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name, tagline } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-4 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-auth-panel p-10 text-auth-panel-foreground lg:flex dark:border-r">
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-3 text-lg font-medium"
                >
                    <AppLogoIcon className="size-10 object-contain" />
                    <span className="flex flex-col">
                        <span>{name}</span>
                        <span className="text-xs font-normal text-auth-panel-muted">
                            {tagline}
                        </span>
                    </span>
                </Link>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <div className="flex items-center gap-3">
                            <AppLogoIcon className="size-10 object-contain" />
                            <span className="flex flex-col text-left">
                                <span className="font-medium">{name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {tagline}
                                </span>
                            </span>
                        </div>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-h1">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
