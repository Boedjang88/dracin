import { useRef, useLayoutEffect } from 'react'

export function useDominantColor(imageUrl: string) {
    const colorRef = useRef<string>('#ffffff')

    // In a real implementation we would use react-color-extractor or canvas analysis
    // For this demo, we'll map known poster URLs to colors or use a hash function
    // since we can't easily run color extraction on external images without CORS issues

    // Simple hash to color function for demo purposes
    const getColorFromUrl = (url: string) => {
        let hash = 0
        for (let i = 0; i < url.length; i++) {
            hash = url.charCodeAt(i) + ((hash << 5) - hash)
        }

        // Generate HSL color with high saturation and lightness for dark theme accents
        const h = hash % 360
        return `hsl(${h}, 70%, 60%)`
    }

    const color = getColorFromUrl(imageUrl)

    useLayoutEffect(() => {
        document.documentElement.style.setProperty('--accent-dynamic', color)
        return () => {
            document.documentElement.style.removeProperty('--accent-dynamic')
        }
    }, [color])

    return color
}
