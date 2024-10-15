import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Form,
  Link
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getUserId } from "~/utils/auth";
import "~/styles/tailwind.css";
import { motion } from "framer-motion";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  return json({ userId });
};

export default function App() {
  const { userId } = useLoaderData<{ userId: string | null }>();

  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta httpEquiv="Content-Language" content="zh-CN, en-US" />
        <Meta />
        <Links />
        <base href="/smartcode/" />
      </head>
      <body className="h-full bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
        <div className="min-h-full flex flex-col">
          <motion.nav
            className="bg-white dark:bg-gray-800 shadow-md"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <Link to="/" className="flex-shrink-0">
                    <img className="h-10 w-10" src="/logo.png" alt="SmartCode Assistant" />
                  </Link>
                  <div className="ml-10 flex items-baseline space-x-4">
                    <Link to="/" className="text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                      主页
                    </Link>
                    <Link to="/add-command" className="text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                      添加命令
                    </Link>
                  </div>
                </div>
                <div className="ml-4 flex items-center md:ml-6">
                  {userId ? (
                    <Form action="/logout" method="post">
                      <motion.button
                        type="submit"
                        className="text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        注销
                      </motion.button>
                    </Form>
                  ) : (
                    <Link to="/login" className="text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                      登录
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.nav>
          <main className="flex-grow">
            <Outlet />
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}