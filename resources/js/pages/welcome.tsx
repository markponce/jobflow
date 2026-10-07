import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';

export default function Welcome() {
    const { auth, name, tagline } = usePage().props;

    return (
        <>
            <Head title="Track your job search" />
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <AppLogoIcon className="size-10" />
                        <div>
                            <p className="font-semibold">{name}</p>
                            <p className="text-xs text-muted-foreground">
                                {tagline}
                            </p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-button font-semibold text-primary-foreground"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-flex h-11 items-center justify-center rounded-md px-4 text-button font-semibold hover:bg-muted"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-button font-semibold text-primary-foreground"
                                >
                                    Get started
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-12 sm:px-6 sm:py-16">
                    <section className="max-w-2xl">
                        <div className="mb-6 flex items-center gap-4">
                            <img
                                src="/JobFlow%20Logo.png"
                                alt={name}
                                className="w-48 object-contain"
                            />
                        </div>
                        <h1 className="text-display font-bold tracking-tight">
                            Keep your job search moving forward.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                            {tagline}. Organize applications, follow every
                            opportunity, and see your progress in one place.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={auth.user ? dashboard() : register()}
                                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-button font-semibold text-primary-foreground"
                            >
                                {auth.user
                                    ? 'Open dashboard'
                                    : 'Create your account'}
                            </Link>
                            {!auth.user && (
                                <Link
                                    href={login()}
                                    className="inline-flex h-11 items-center justify-center rounded-md border px-5 text-button font-semibold hover:bg-muted"
                                >
                                    Log in
                                </Link>
                            )}
                        </div>
                    </section>
                </main>
                <footer className="border-t px-4 py-5 text-center text-sm text-muted-foreground sm:px-6">
                    {tagline}
                </footer>
            </div>
        </>
    );
}
