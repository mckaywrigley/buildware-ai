import { useEffect, useState } from "react"

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number
    height: number
  }>({
    width: 0,
    height: 0
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener("resize", handleResize)

    // Call handler right away so state gets updated with initial window size
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowSize
}

export default useWindowSize
