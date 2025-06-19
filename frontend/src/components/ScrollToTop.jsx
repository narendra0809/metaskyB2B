import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = ({ children }) => {
  const pathname = useLocation().pathname
  const container = useRef(null)

  useEffect(() => {
    container.current.scrollIntoView({
      behavior: 'smooth',
    })
  }, [pathname])

  return <div ref={container}>{children}</div>
}

export default ScrollToTop
