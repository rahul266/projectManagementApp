import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

const Navbar: React.FC = () => {
    const sessionData = useSession()
    const router=useRouter()
    return (
        <nav className="bg-stone-200 p-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <div className="text">
                            <p className="text-lg font-bold mx-5">App Logo</p>
                    </div>
                    <div className="flex space-x-4 mx-10">
                        <Link legacyBehavior href="/">
                            <a className="text">Home</a>
                        </Link>
                        <Link legacyBehavior href="/projects">
                            <a className="text">Projects</a>
                        </Link>
                        <div className="cursor-pointer" onClick={() => { router.push(`/teams/${sessionData.data?.user.id}`) }}>
                            <a className="text">Teams</a>
                        </div>
                    </div>
                    <div>
                        <div className="cursor-pointer" onClick={() => { router.push(`/ticket/create/${sessionData.data?.user.id}`) }}>
                            <a className="bg-orange-400 text px-4 py-2 rounded">Create</a>
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    <Image
                        src="/logout2.png"
                        alt="some-image"
                        width={50}
                        height={50}
                        className="rounded-full mx-5 cursor-pointer"
                        onClick={sessionData ? () => void signOut() : () => void signIn()}
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
