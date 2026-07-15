import { useEffect, useRef, useState } from 'react'
import './VersionSelect.css'

const VERSIONS = [
  '1.21.4',
  '1.16.5',
  '1.8.9']

export default function VersionSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleSelect = (version) => {
    onChange(version)
    setOpen(false)
  }

  return (
    <div className="version-select" ref={rootRef}>
      {open && (
        <ul className="version-select__menu pixel-panel" role="listbox">
          {VERSIONS.map((version) => (
            <li key={version}>
              <button
                type="button"
                className={
                  'version-select__option' +
                  (version === value ? ' version-select__option--active' : '')
                }
                role="option"
                aria-selected={version === value}
                onClick={() => handleSelect(version)}
              >
                <span className="pixel-btn__label">{version}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="pixel-btn version-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="pixel-btn__label">{value}</span>
        <svg
          className={'version-select__arrow' + (open ? ' version-select__arrow--open' : '')}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          aria-hidden="true"
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
    </div>
  )
}
