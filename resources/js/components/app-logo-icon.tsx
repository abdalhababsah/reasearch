import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo-small.png"
            alt={props.alt ?? 'Logo'}
            {...props}
        />
    );
}
