import React, { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { cn } from '../lib/utils'

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false)

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true)
        } else {
            setIsVisible(false)
        }
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility)
        return () => {
            window.removeEventListener('scroll', toggleVisibility)
        }
    }, [])

    return (
        <div className="fixed bottom-5 right-5">
            <button
                type="button"
                onClick={scrollToTop}
                className={cn(
                    isVisible ? 'opacity-100' : 'opacity-0',
                    'bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition-opacity duration-300'
                )}
            >
                <ChevronUp className="h-6 w-6" />
            </button>
        </div>
    )
}

export default BackToTop
