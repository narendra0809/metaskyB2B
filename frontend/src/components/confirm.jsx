import React from 'react'
import { Dialog } from '@mui/material'

function Confirm({ open, handleClose, handleConfirm, children }) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '90%',
          maxWidth: '300px',
          borderRadius: '7px',
        },
      }}
    >
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div className="p-3">
          <>
            <div className="border-bottom border-light-subtle">
              <p className="fs-6 text-center py-3">{children}</p>
            </div>
            <div className="mt-3 text-center">
              <button className="btn btn-success me-3" onClick={handleConfirm}>
                Yes
              </button>
              <button className="btn btn-danger" onClick={handleClose}>
                No
              </button>
            </div>
          </>
        </div>
      </div>
    </Dialog>
  )
}
export default Confirm
