import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { api } from "~/utils/api";

export default function Home() {
  console.log('in home');
  const hello = api.post.hello.useQuery({ text: "from tRPC" });
  const sessionData = useSession()
  if (sessionData.status != "authenticated") {
    return (<div className=" flex min-h-screen flex-col items-center justify-center ">
      <AuthShowcase />
    </div>)
  }
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center">
        {sessionData.data && (
          <div className="top-0 text-xl font-semibold mt-4">
            Welcome {sessionData.data.user.name}!!!
          </div>
        )}
        <AuthShowcase />
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.post.getSecretMessage.useQuery(
    undefined,
    { enabled: sessionData?.user !== undefined }
  );
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {sessionData ?
        "" : 
      <button
        className="rounded-full bg-orange-400 px-10 py-3  font-semibold text-black no-underline transition hover:shadow-lg"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          Sign in
        </button>}
    </div>
  );
}
