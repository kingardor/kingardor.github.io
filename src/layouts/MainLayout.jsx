import React from 'react'
import Header from '../sections/Header/Header'
import Footer from '../components/ui/Footer'
import ChatFAB from '../components/ui/ChatFAB'

export default function MainLayout({ children, views, showFAB }) {
    return (
        <>
            <main className="min-h-screen scroll-smooth font-[ui-sans-serif] text-zinc-100 antialiased">
                <Header />
                {children}
                <Footer views={views} />
            </main>
            {showFAB && (
                <ChatFAB onClick={() => { location.hash = '/chat'; }} label="ask veronica" />
            )}
        </>
    )
}
