// import { Dialog } from "@mui/material";

// function Modal({ open, handleClose, title = "", children, maxWidth = 600 }) {
//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       sx={{
//         "& .MuiDialog-paper": {
//           width: "90%",
//           maxWidth: `${maxWidth}px`,
//           borderRadius: "7px",
//         },
//       }}
//     >
//       <div style={{ width: "100%", maxWidth: `${maxWidth}px` }}>
//         <div className="d-flex justify-content-between align-items-center p-3 border border-bottom border-light-subtle">
//           <h2 className="h5 m-0">{title}</h2>
//           <button
//             className="btn outline-none flex-shrink-0"
//             onClick={handleClose}
//           >
//             <i className="fa-solid fa-xmark"></i>
//           </button>
//         </div>
//         <div>{children}</div>
//       </div>
//     </Dialog>
//   );
// }
// export default Modal;

import { Dialog } from "@mui/material";

function Modal({ open, handleClose, title = "", children, maxWidth = 600 }) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="paper" // Ensures the scrollbar is inside the modal, not the body
      sx={{
        "& .MuiDialog-paper": {
          width: "90%",
          maxWidth: `${maxWidth}px`,
          borderRadius: "7px",
        },
      }}
    >
      <div style={{ width: "100%", maxWidth: `${maxWidth}px` }}>
        {/* Header Section */}
        <div
          className="d-flex justify-content-between align-items-center p-3 border-bottom"
          style={{
            position: "sticky", // 1. Makes it stick
            top: 0, // 2. Sticks to the very top // 3. Prevents content from showing behind it
            zIndex: 100, // 4. Keeps it above the scrolling content
            borderTopLeftRadius: "7px", // Maintain border radius matching the parent
            borderTopRightRadius: "7px",
          }}
        >
          <h2 className="h5 m-0">{title}</h2>
          <button
            className="btn outline-none flex-shrink-0"
            onClick={handleClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content Section */}
        <div>{children}</div>
      </div>
    </Dialog>
  );
}

export default Modal;
