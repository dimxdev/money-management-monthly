import { m as M } from 'motion/react'

// Entrance animation halaman: section muncul satu per satu (naik + fade + spring).
// Pakai: <Stagger className="..."> lalu bungkus tiap section dengan <StaggerItem>.
// Anak yang punya animasi sendiri (initial/animate eksplisit) tidak ikut terpengaruh.
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    // Spring lembut & pelan — tiap section mengambang naik ±0.8 detik
    transition: { type: 'spring', stiffness: 130, damping: 20, mass: 1 },
  },
}

export function Stagger({ children, className = '' }) {
  return (
    <M.div className={className} variants={containerVariants} initial="hidden" animate="show">
      {children}
    </M.div>
  )
}

export function StaggerItem({ children, className = '' }) {
  return (
    <M.div className={className} variants={itemVariants}>
      {children}
    </M.div>
  )
}
