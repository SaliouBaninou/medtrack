import SingnInPage from "./pages/auth/SingnIn.tsx"
import SingnUpPage from "./pages/auth/SingnUp.tsx"

import { Toaster } from "./components/ui/sonner"

import AdminHome from "./pages/admin/Home.tsx"
import Etablissements from "./pages/admin/Etablissements.tsx"
import MonProfil from "./pages/admin/MonProfil.tsx"
import AdminLayout from "./pages/layouts/admin-layout.tsx"

import Home from "./pages/publics/Home.tsx"
import ForgotPassword from "./pages/auth/ForgotPassword.tsx"
import VerifyCode from "./pages/auth/VerifyCode.tsx"
import ResetPassword from "./pages/auth/ResetPassword.tsx"
import ChangePassword from "./pages/auth/ChangePassword.tsx"

import ProtectedRoute from "./components/auth/ProtectedRoute.tsx"

import { createBrowserRouter, RouterProvider, Outlet } from "react-router"
import AdminRoute from "./components/admin/RoleRoute.tsx"
import { NuqsAdapter } from "nuqs/adapters/react-router/v8"

function RootLayout() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      { path: "/auth/sign-in", Component: SingnInPage },
      { path: "/auth/sign-up", Component: SingnUpPage },
      { path: "/auth/mot-de-passe-oublie", Component: ForgotPassword },
      { path: "/auth/verifier-code", Component: VerifyCode },
      { path: "/auth/nouveau-mot-de-passe", Component: ResetPassword },
      { path: "/auth/changer-mot-de-passe", Component: ChangePassword },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminRoute />,
            children: [
              {
                path: "/admin",
                Component: AdminLayout,
                children: [
                  {
                    index: true,
                    Component: AdminHome,
                  },
                  {
                    path: "etablissements",
                    Component: Etablissements,
                  },
                  {
                    path: "profil",
                    Component: MonProfil,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])

function App() {
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  )
}

export default App
