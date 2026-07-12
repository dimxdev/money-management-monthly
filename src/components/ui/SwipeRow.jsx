import { useRef, useEffect } from 'react'
import { m as M, useMotionValue, useTransform, useAnimationControls } from 'motion/react'

// Baris yang bisa digeser ke kiri untuk memunculkan tombol aksi (ala iOS).
// - Geser melewati 1/3 lebar aksi (atau flick cepat) → terbuka; geser balik → menutup.
// - Aksi disembunyikan saat tertutup (opacity 0) supaya tidak mengintip
//   dari balik Card glass yang translusen.
// - touchAction pan-y: scroll vertikal halaman tetap normal.
// - Menekan salah satu tombol aksi otomatis menutup geseran; begitu juga saat
//   baris dinonaktifkan (mis. sedang diedit inline), posisi geser di-reset.
export function SwipeRow({ children, actions, actionWidth = 128, disabled = false }) {
  const x = useMotionValue(0)
  const controls = useAnimationControls()
  const isOpen = useRef(false)
  const actionsOpacity = useTransform(x, [-24, 0], [1, 0])

  function snap(open) {
    isOpen.current = open
    controls.start({
      x: open ? -actionWidth : 0,
      transition: { type: 'spring', stiffness: 420, damping: 34 },
    })
  }

  // Reset posisi begitu baris dinonaktifkan → saat aktif lagi tidak "terbuka" lagi.
  useEffect(() => {
    if (disabled) {
      isOpen.current = false
      x.set(0)
    }
  }, [disabled, x])

  if (disabled) return <div>{children}</div>

  return (
    <div className="relative">
      <M.div
        style={{ opacity: actionsOpacity, width: actionWidth }}
        className="absolute inset-y-0 right-0 flex items-center justify-end gap-2 pr-0.5"
        onClick={() => snap(false)}
        aria-hidden
      >
        {actions}
      </M.div>
      <M.div
        drag="x"
        dragConstraints={{ left: -actionWidth, right: 0 }}
        dragElastic={0.06}
        dragMomentum={false}
        style={{ x, touchAction: 'pan-y' }}
        animate={controls}
        onDragEnd={(_, info) => {
          const next = isOpen.current
            ? !(info.offset.x > actionWidth / 3 || info.velocity.x > 250)
            : info.offset.x < -actionWidth / 3 || info.velocity.x < -250
          snap(next)
        }}
        onClick={() => isOpen.current && snap(false)}
        className="relative z-10"
      >
        {children}
      </M.div>
    </div>
  )
}
