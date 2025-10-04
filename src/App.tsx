import { Outlet } from 'react-router-dom';
import './App.css'
import { AppSidebar } from './components/AppSidebar';
// import HeaderBar from './components/HeaderBar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { CookieStorage } from './lib/cookie';
import { SiteHeader } from './components/SiteHeader';
import { BreadcrumbProvider } from './contexts/BreadcrumbContext';
import { Toaster } from './components/ui/sonner';
// import Counter from './components/Counter'

function App() {
    
    const defaultOpen  = CookieStorage.getItem("sidebar_state") === "true"; // read directly    

    return (
        // <SidebarProvider defaultOpen={defaultOpen}>
        // <SideBar />
        // <main className='w-full p-2 border-1 border-gray-400'>
        //     <SidebarTrigger />
        //     <Outlet />
        // </main>
        // </SidebarProvider>
            <BreadcrumbProvider>
                <SidebarProvider
                    defaultOpen={defaultOpen}
                    style={
                        {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                    >
                    <AppSidebar variant="inset" />
                    <SidebarInset>
                        <SiteHeader />
                        <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <Outlet />
                        </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
                <Toaster />
            </BreadcrumbProvider>
    )
}

export default App

    // <SidebarProvider>
    //     <div className='viewport'>

    //         <div className='sidebar-container'> {/* navbar */}
    //             <SideBar />
    //         </div>
            
    //         <div className='right-section-container'> {/* pages */}
    //             <div className='header-bar-container'>
    //                 <HeaderBar />
    //             </div>
    //             <div className='outlet-container'>
    //                 <SidebarTrigger />
    //                 <Outlet />
    //             </div>
    //         </div>

    //     </div>
    // </SidebarProvider>