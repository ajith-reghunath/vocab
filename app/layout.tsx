import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Vocab Builder',
    description: 'Long-term memory vocabulary learning.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300..800&display=swap" rel="stylesheet" />
            </head>
            <body className="min-h-screen bg-background text-foreground tracking-wide antialiased selection:bg-primary/20">
                <main className="max-w-md mx-auto min-h-screen flex flex-col relative pb-20">
                    {/* Mobile-first centered container */}
                    {children}
                </main>
            </body>
        </html>
    );
}
