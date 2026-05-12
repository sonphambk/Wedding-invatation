'use client'
import { useEffect, useState } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PhotoEntry } from '@/lib/types'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

function SortablePhoto({ photo, onDelete }: { photo: PhotoEntry; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.url })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform), transition,
        opacity: isDragging ? .5 : 1, position: 'relative',
        borderRadius: 10, overflow: 'hidden', aspectRatio: '1',
        background: '#f0ebe4', cursor: 'grab',
      }}
      {...attributes} {...listeners}
    >
      <Image src={photo.url} alt={`Photo ${photo.sort_order}`} fill style={{ objectFit: 'cover' }} sizes="120px" />
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        style={{
          position: 'absolute', top: 4, right: 4, width: 24, height: 24,
          background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none',
          borderRadius: '50%', fontSize: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Xoá ảnh"
      >✕</button>
    </div>
  )
}

export default function PhotoManager() {
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const [uploadError, setUploadError] = useState<string>('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetch('/api/config').then((r) => r.json()).then((d) => { setPhotos(d.photos ?? []); setLoading(false) })
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setPhotos((prev) => {
      const oldIndex = prev.findIndex((p) => p.url === active.id)
      const newIndex = prev.findIndex((p) => p.url === over.id)
      return arrayMove(prev, oldIndex, newIndex).map((p, i) => ({ ...p, sort_order: i }))
    })
    setDirty(true)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setUploadError('')
    const supabase = createClient()
    const newPhotos: PhotoEntry[] = []
    for (const file of files) {
      try {
        const signRes = await fetch('/api/upload/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sign', name: file.name, type: file.type }),
        })
        const sign = await signRes.json().catch(() => ({}))
        if (!signRes.ok) throw new Error(sign.error || `Sign failed (${signRes.status})`)

        const { error: upErr } = await supabase.storage
          .from('wedding-photos')
          .uploadToSignedUrl(sign.path, sign.token, file, {
            contentType: file.type || 'image/jpeg',
            upsert: true,
          })
        if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`)

        newPhotos.push({ url: sign.publicUrl, sort_order: photos.length + newPhotos.length })
      } catch (err) {
        setUploadError(`${file.name}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    setPhotos((prev) => [...prev, ...newPhotos])
    if (newPhotos.length) setDirty(true)
    setUploading(false)
    e.target.value = ''
  }

  function deletePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p.url !== url).map((p, i) => ({ ...p, sort_order: i })))
    setDirty(true)
  }

  async function saveOrder() {
    setSaving(true)
    await fetch('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos }),
    })
    setSaving(false)
    setDirty(false)
  }

  if (loading) return <p className="font-body text-sm text-soft py-4">Đang tải...</p>

  return (
    <div className="py-4">
      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#E4D8C6] rounded-xl cursor-pointer hover:border-burg transition-colors bg-white mb-4">
        <span className="text-2xl mb-1">{uploading ? '⏳' : '📷'}</span>
        <span className="font-body text-sm text-soft">
          {uploading ? 'Đang upload...' : 'Chọn ảnh để upload (JPG/PNG/WEBP)'}
        </span>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 font-body text-sm mb-3">
          ⚠️ {uploadError}
        </div>
      )}

      {photos.length > 0 ? (
        <>
          <p className="font-body text-xs text-soft mb-2">Kéo để sắp xếp lại · {photos.length} ảnh</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={photos.map((p) => p.url)} strategy={rectSortingStrategy}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1rem' }}>
                {photos.map((photo) => (
                  <SortablePhoto key={photo.url} photo={photo} onDelete={() => deletePhoto(photo.url)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {dirty && (
            <button onClick={saveOrder} disabled={saving}
              className="w-full bg-burg text-cream font-body font-medium py-2.5 rounded-xl hover:bg-burg-2 transition-colors disabled:opacity-60">
              {saving ? 'Đang lưu...' : '💾 Lưu thứ tự ảnh'}
            </button>
          )}
        </>
      ) : (
        <p className="font-body text-sm text-soft text-center py-6 italic">Chưa có ảnh nào</p>
      )}
    </div>
  )
}
