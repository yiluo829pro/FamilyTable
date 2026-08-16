import { useEffect, useRef, useState } from 'react'

// Card preview aspect ratio (matches h-36 card image area, roughly 3:2)
const CROP_RATIO = 3 / 2

interface Props {
  file: File
  onConfirm: (croppedFile: File) => void
  onCancel: () => void
}

async function cropToFile(
  img: HTMLImageElement,
  file: File,
  offsetXPct: number, // 0–1
  offsetYPct: number,
): Promise<File> {
  const canvas = document.createElement('canvas')
  // Determine crop rect in natural image pixels
  let cropW: number, cropH: number
  if (img.naturalWidth / img.naturalHeight > CROP_RATIO) {
    cropH = img.naturalHeight
    cropW = cropH * CROP_RATIO
  } else {
    cropW = img.naturalWidth
    cropH = cropW / CROP_RATIO
  }
  const maxX = img.naturalWidth - cropW
  const maxY = img.naturalHeight - cropH
  const x = Math.max(0, Math.min(maxX, maxX * offsetXPct))
  const y = Math.max(0, Math.min(maxY, maxY * offsetYPct))

  // Output at 2× for retina
  canvas.width = Math.round(cropW)
  canvas.height = Math.round(cropH)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, x, y, cropW, cropH, 0, 0, canvas.width, canvas.height)

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(new File([blob!], file.name, { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  })
}

export default function PhotoCropPicker({ file, onConfirm, onCancel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [src, setSrc] = useState('')
  const [loaded, setLoaded] = useState(false)

  // Offset of image top-left inside container, in pixels
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)

  // Container display size
  const CONTAINER_W = 400
  const CONTAINER_H = Math.round(CONTAINER_W / CROP_RATIO)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Once image loads, size it to cover the container and center it
  const handleLoad = () => {
    setLoaded(true)
    const img = imgRef.current!
    const scale = Math.max(CONTAINER_W / img.naturalWidth, CONTAINER_H / img.naturalHeight)
    const displayW = img.naturalWidth * scale
    const displayH = img.naturalHeight * scale
    setOffset({ x: -(displayW - CONTAINER_W) / 2, y: -(displayH - CONTAINER_H) / 2 })
  }

  const getDisplaySize = () => {
    const img = imgRef.current
    if (!img || !loaded) return { w: CONTAINER_W, h: CONTAINER_H }
    const scale = Math.max(CONTAINER_W / img.naturalWidth, CONTAINER_H / img.naturalHeight)
    return { w: img.naturalWidth * scale, h: img.naturalHeight * scale }
  }

  const clampOffset = (ox: number, oy: number) => {
    const { w, h } = getDisplaySize()
    return {
      x: Math.min(0, Math.max(-(w - CONTAINER_W), ox)),
      y: Math.min(0, Math.max(-(h - CONTAINER_H), oy)),
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current) return
    const dx = e.clientX - dragStart.current.mx
    const dy = e.clientY - dragStart.current.my
    setOffset(clampOffset(dragStart.current.ox + dx, dragStart.current.oy + dy))
  }
  const onMouseUp = () => { dragStart.current = null }

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragStart.current) return
    const t = e.touches[0]
    const dx = t.clientX - dragStart.current.mx
    const dy = t.clientY - dragStart.current.my
    setOffset(clampOffset(dragStart.current.ox + dx, dragStart.current.oy + dy))
  }

  const handleConfirm = async () => {
    const img = imgRef.current!
    const { w, h } = getDisplaySize()
    // Convert display offset back to natural-pixel percentages
    const maxDispX = w - CONTAINER_W
    const maxDispY = h - CONTAINER_H
    const pctX = maxDispX > 0 ? Math.abs(offset.x) / maxDispX : 0.5
    const pctY = maxDispY > 0 ? Math.abs(offset.y) / maxDispY : 0.5
    const cropped = await cropToFile(img, file, pctX, pctY)
    onConfirm(cropped)
  }

  const { w: displayW, h: displayH } = getDisplaySize()

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full">
        <h3 className="font-heading text-lg font-semibold text-forest mb-1">Adjust cover photo</h3>
        <p className="text-stone-500 text-sm mb-4">Drag the photo to choose which part shows on the card.</p>

        {/* Crop viewport */}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-xl mx-auto cursor-grab active:cursor-grabbing select-none"
          style={{ width: CONTAINER_W, height: CONTAINER_H, maxWidth: '100%' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onMouseUp}
        >
          {src && (
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              onLoad={handleLoad}
              draggable={false}
              style={{
                position: 'absolute',
                width: displayW,
                height: displayH,
                left: offset.x,
                top: offset.y,
                userSelect: 'none',
              }}
            />
          )}
          {/* Rule-of-thirds grid overlay */}
          {loaded && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border border-white/30" />
              <div className="absolute top-1/3 left-0 right-0 border-t border-white/20" />
              <div className="absolute top-2/3 left-0 right-0 border-t border-white/20" />
              <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/20" />
              <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/20" />
            </div>
          )}
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest" />
            </div>
          )}
        </div>

        <p className="text-stone-400 text-xs text-center mt-2 mb-5">Drag to reposition</p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-outline flex-1">Cancel</button>
          <button onClick={handleConfirm} disabled={!loaded} className="btn-primary flex-1 disabled:opacity-40">
            Use this crop
          </button>
        </div>
      </div>
    </div>
  )
}
