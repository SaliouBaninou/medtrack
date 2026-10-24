import SingnInPage from "./pages/auth/SingnIn.tsx"
import SingnUpPage from "./pages/auth/SingnUp.tsx"

import { Toaster } from "./components/ui/sonner"

import AdminHome from "./pages/admin/Home.tsx"
import Etablissements from "./pages/admin/Etablissements.tsx"
import EtablissementAdmins from "./pages/admin/EtablissementAdmins.tsx"
import Patients from "./pages/admin/Patients.tsx"
import Doctors from "./pages/admin/Doctors.tsx"
import MonProfil from "./pages/admin/MonProfil.tsx"
import AdminLayout from "./pages/layouts/admin-layout.tsx"
import DoctorLayout from "./pages/layouts/doctor-layout.tsx"
import DoctorHome from "./pages/doctor/Home.tsx"
import DoctorPatients from "./pages/doctor/Patients.tsx"
import Treatments from "./pages/doctor/Treatments.tsx"

import Home from "./pages/publics/Home.tsx"
import ForgotPassword from "./pages/auth/ForgotPassword.tsx"
import VerifyCode from "./pages/auth/VerifyCode.tsx"
import ResetPassword from "./pages/auth/ResetPassword.tsx"
import ChangePassword from "./pages/auth/ChangePassword.tsx"

import ProtectedRoute from "./components/auth/ProtectedRoute.tsx"

import { createBrowserRouter, RouterProvider, Outlet } from "react-router"
import AdminRoute, { AdminOnlyRoute, SuperadminRoute } from "./components/admin/RoleRoute.tsx"
import DoctorRoute from "./components/doctor/DoctorRoute.tsx"
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
            element: <DoctorRoute />,
            children: [{
              path: "/medecin",
              Component: DoctorLayout,
              children: [
                { index: true, Component: DoctorHome },
                { path: "patients", Component: DoctorPatients },
                { path: "traitements", Component: Treatments },
              ],
            }],
          },
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
                    element: <SuperadminRoute />,
                    children: [
                      { path: "etablissements", Component: Etablissements },
                      { path: "etablissements/:id/admins", Component: EtablissementAdmins },
                    ],
                  },
                  { element: <AdminOnlyRoute />, children: [{ path: "medecins", Component: Doctors }] },
                  {
                    path: "patients",
                    Component: Patients,
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
