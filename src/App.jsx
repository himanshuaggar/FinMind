import TransactionPage from "./pages/Transaction/TransactionPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Support from "./pages/Support/Support"
import Advisor from "./pages/Advisor/Advisor";
import Analyser from "./pages/Analyser/Analyser";
import Bot from "./pages/Bot/Bot";
import { ThemeProvider, createTheme } from '@mui/material'
import { CssBaseline } from '@mui/material'

const router = createBrowserRouter([
  { 
    path: "/",
    element: <Dashboard/>,
  },
  { 
    path: "/transactions",
    element: <TransactionPage/>,
  },
  { 
    path: "/support",
    element: <Support/>,
  },
  { 
    path: "/bot",
    element: <Bot/>,
  },
  {
    path: "/advisor",
    element: <Advisor/>,
  },
  {
    path: "/analyser",
    element: <Analyser/>,
  },
])

const theme = createTheme({
  palette: {
    mode: 'light'
  }
})

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router}/>
    </ThemeProvider>
  )
}

export default App