import React, { Children } from 'react'
import { ThemeProvider } from '../app/theme-provider'
import { Toaster } from '../components/ui/sonner'
const ThemeProviderC = ({children} : {children :React.ReactNode}) => {
  return (
  <>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >

     {children}
     <Toaster />
     </ThemeProvider>
    </>
  )
}

export default ThemeProviderC