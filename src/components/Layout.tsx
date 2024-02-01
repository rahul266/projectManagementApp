// components/Layout.tsx
import React, { ReactNode } from 'react';
import Navbar from './navbar';
import { useSession } from 'next-auth/react';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const sessionData = useSession()
    if (sessionData.status == 'loading') {
        return (<div className='center'>Loading...</div>)
    }
    if (sessionData.status != "authenticated") {
        return (<div>{children}</div>)
    }
    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-4">
                {children}
            </div>
        </div>
    );
};

export default Layout;
