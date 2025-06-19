import React from 'react'
import { Dialog } from '@mui/material'

function FullModal({ open, handleClose, title, children }) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '90%',
          borderRadius: '7px',
        },
      }}
    >
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div className="d-flex justify-content-between align-items-center p-3 border border-bottom border-light-subtle">
          <h2 className="h5 m-0">{title}</h2>
          <button
            className="btn outline-none flex-shrink-0"
            onClick={handleClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </Dialog>
  )
}
export default FullModal
