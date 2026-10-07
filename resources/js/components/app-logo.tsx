import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name, tagline } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-surface-elevated">
                <AppLogoIcon className="size-7 object-contain" />
            </div>
            <div className="ml-1 grid min-w-0 flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
                <span className="truncate text-[10px] leading-tight text-muted-foreground">
                    {tagline}
                </span>
            </div>
        </>
    );
}
