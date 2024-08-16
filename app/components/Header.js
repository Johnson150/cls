"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
    const pathname = usePathname();

    const navItems = [
        { label: "Login", href: "/login" },
        { label: "Home", href: "/home" },
        { label: "Tutors", href: "/tutor" },
        { label: "Students", href: "/student" },
    ];

    return (
        <header className="bg-gray-800 text-white shadow-lg py-3 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <img src="/bpa.webp" alt="NBA Logo" className="h-20 w-auto" />
                    <h1 className="text-3xl font-bold">NBAlytics</h1>
                </div>
                <nav className="bg-gray-700 p-2 rounded-lg">
                    <ul className="flex space-x-4">
                        {navItems.map((link, index) => (
                            <li
                                key={index}
                                className={`px-3 py-2 rounded ${pathname === link.href
                                    ? "bg-orange-500 text-white"
                                    : "hover:bg-gray-600"
                                    }`}
                            >
                                <Link href={link.href}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
