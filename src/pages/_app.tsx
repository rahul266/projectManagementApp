import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { api } from "~/utils/api";
import Layout from "~/components/Layout";
import Router, { useRouter } from 'next/router';
import "~/styles/globals.css";
import "react-datepicker/dist/react-datepicker.css"

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className="bg-stone-100">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
