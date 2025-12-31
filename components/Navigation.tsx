'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, Library, Brain } from 'lucide-react';
import { clsx } from 'clsx';

export function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/test', icon: Brain, label: 'Review' }, // Important center piece
        { href: '/add-word', icon: PlusCircle, label: 'Add' },
        { href: '/library', icon: Library, label: 'Library' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/90 backdrop-blur-lg border-t border-white/10 pb-6 pt-2">
            <div className="max-w-md mx-auto flex justify-around items-center px-4">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "flex flex-col items-center gap-1 p-2 transition-all duration-300",
                                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-zinc-300"
                            )}
                        >
                            <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                            {isActive && <span className="w-1 h-1 rounded-full bg-primary mt-1" />}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
