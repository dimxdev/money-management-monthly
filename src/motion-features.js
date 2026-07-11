// Fitur animasi Motion untuk LazyMotion — dimuat async supaya tidak membebani bundle awal.
// domMax = animasi dasar + layout animation + gesture (drag/pan).
import { domMax } from 'motion/react'
export default domMax
