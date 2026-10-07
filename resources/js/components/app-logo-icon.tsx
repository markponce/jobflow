import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    alt = '',
    ...props
}: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>) {
    return <img src="/jobflow-mark.png" alt={alt} {...props} />;
}
