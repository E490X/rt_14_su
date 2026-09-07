// import React, { useEffect, useRef, useState } from "react";
// import {
//   Box,
//   Typography,
//   Grid,
//   Button,
//   Modal,
//   IconButton,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import { Formik, Form } from "formik";
// import * as Yup from "yup";
// import useScriptRef from "hooks/useScriptRef";
// import ApiUtils from "api/ApiUtils";
// import { ToasterMessage } from "helper/ToasterHelper";
// import { useDropzone } from "react-dropzone";
// import { FaTrash } from "react-icons/fa6";

// const CommonFolderUploadModal = ({
// userDeviceId,
//   open,
//   title,
//   setOpenModal,
//   fetchData,
//   Url,
//   params = "",
//   setToDate = "",
// }) => {
//   const style = {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     width: "60%",
//     bgcolor: "background.paper",
//     boxShadow: 24,
//     p: 4,
//   };

//   const formikRef = useRef();
//   const scriptedRef = useScriptRef();
//   const [files, setFiles] = useState([]);
//   const imeiNumber = localStorage.getItem("imeiNumber");

//   // âœ… Only required validation (no type restriction)
//   const validationSchemaExcel = Yup.object({
//     files: Yup.array().min(1, "Please upload at least one file."),
//   });

//   const handleBulkImportForm = async () => {
//     for (const item of files) {
//       try {
//         const payload = new FormData();
//         payload.append("files", item);
//         payload.append(
//           "path",
//           item.webkitRelativePath || item.name
//         );

//         const response = await ApiUtils.AddBulkImage(
//           Url,
//           payload,
//           imeiNumber
//         );

//         if (response?.data?.isSuccess) {
//           ToasterMessage("success", "Data added Successfully!");
//           if (params) fetchData(params);
//           else {
//             if (setToDate) setToDate(new Date());
//             fetchData();
//           }
//         } else {
//           ToasterMessage("error", "Something went wrong");
//         }
//       } catch (err) {
//         ToasterMessage("error", err?.message || "Upload failed");
//       }
//     }

//     setFiles([]);
//     setOpenModal(false);
//   };

//   useEffect(() => {
//     setFiles([]);
//   }, [open]);

//   useEffect(() => {
//     return () => {
//       files.forEach((file) => URL.revokeObjectURL(file));
//     };
//   }, [files]);

//   return (
//     <Modal
//       keepMounted
//       open={open}
//       onClose={() => {
//         if (formikRef.current) {
//           formikRef.current.resetForm();
//         }
//         setOpenModal(false);
//       }}
//     >
//       <Box sx={style}>
//         <Formik
//           innerRef={formikRef}
//           initialValues={{ files: [] }}
//           validationSchema={validationSchemaExcel}
//           onSubmit={async (_, { resetForm }) => {
//             handleBulkImportForm();
//             await resetForm();
//           }}
//         >
//           {({ errors, touched, setFieldValue, resetForm }) => {
//             const onDrop = (acceptedFiles) => {
//               setFiles((prev) => [...prev, ...acceptedFiles]);
//               setFieldValue("files", [...files, ...acceptedFiles]);
//             };

//             const { getRootProps, getInputProps, isDragActive } =
//               useDropzone({
//                 onDrop,
//                 multiple: true, // âœ… no accept restriction
//               });

//             const handleRemove = (index) => {
//               const updatedFiles = files.filter(
//                 (_, i) => i !== index
//               );
//               setFiles(updatedFiles);
//               setFieldValue("files", updatedFiles);
//             };

//             return (
//               <Form>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     mb: "15px",
//                   }}
//                 >
//                   <Typography variant="h3">{title}</Typography>
//                   <IconButton
//                     onClick={() => {
//                       resetForm();
//                       setOpenModal(false);
//                     }}
//                   >
//                     <CloseIcon />
//                   </IconButton>
//                 </Box>

//                 <Grid container spacing={2}>
//                   <Grid item xs={12} lg={3} />
//                   <Grid item xs={12} lg={6}>
//                     <Box
//                       {...getRootProps()}
//                       sx={{
//                         border: "2px dashed #1976d2",
//                         borderRadius: "8px",
//                         padding: "20px",
//                         textAlign: "center",
//                         backgroundColor: isDragActive
//                           ? "#f0f8ff"
//                           : "#fafafa",
//                         cursor: "pointer",
//                         marginBottom: "40px",
//                       }}
//                     >
//                       <input
//                         {...getInputProps({
//                           webkitdirectory: "true",
//                           directory: "true",
//                         })}
//                       />
//                       <Typography variant="h6">
//                         {isDragActive
//                           ? "Drop files here..."
//                           : "Drag & drop files/folders here, or click to upload"}
//                       </Typography>

//                       {errors.files && touched.files && (
//                         <Typography color="error" variant="caption">
//                           {errors.files}
//                         </Typography>
//                       )}
//                     </Box>
//                   </Grid>

//                   <Grid
//                     container
//                     spacing={2}
//                     mb={2}
//                     sx={{ maxHeight: "500px", overflowY: "auto" }}
//                   >
//                     {files.map((item, key) => (
//                       <Grid key={key} item xs={12} lg={6}>
//                         <Box
//                           sx={{
//                             mt: 2,
//                             p: 1,
//                             border: "1px solid #ddd",
//                             borderRadius: "8px",
//                             backgroundColor: "#f9f9f9",
//                           }}
//                         >
//                           <Typography
//                             variant="body2"
//                             display="flex"
//                             justifyContent="space-between"
//                             alignItems="center"
//                           >
//                             {item.webkitRelativePath || item.name}

//                             <Button
//                               color="error"
//                               size="small"
//                               onClick={() => handleRemove(key)}
//                             >
//                               <FaTrash />
//                             </Button>
//                           </Typography>
//                         </Box>
//                       </Grid>
//                     ))}
//                   </Grid>

//                   <Grid item xs={12}>
//                     <Box sx={{ display: "flex", justifyContent: "center" }}>
//                       <Button type="submit" variant="contained">
//                         Submit
//                       </Button>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </Form>
//             );
//           }}
//         </Formik>
//       </Box>
//     </Modal>
//   );
// };

// export default CommonFolderUploadModal;
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Modal,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ApiUtils from "api/ApiUtils";
import { ToasterMessage } from "helper/ToasterHelper";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa6";

const CommonFolderUploadModal = ({
  userDeviceId,
  open,
  title,
  setOpenModal,
  fetchData,
  Url,
  params = "",
  setToDate = "",
}) => {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "60%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  const formikRef = useRef();

  const [files, setFiles] = useState([]);
  const [displayItem, setDisplayItem] = useState(null);
  const [uploadType, setUploadType] = useState("folder"); // "file", "folder", "both"
  const imeiNumber = localStorage.getItem("imeiNumber");

  // const validationSchema = Yup.object({
  //   files: Yup.array()
  //     .required("Please upload a file or folder")
  //     .min(1, "Please upload a file or folder"),
  // });
  // Validation: max 100MB per file
  const MAX_FILE_SIZE = 100 * 1024 * 1024;

  const validationSchema = Yup.object().shape({
    files: Yup.array()
      .min(1, "Please select at least one file/folder")
      .test("fileSize", "Each file must be less than 100MB", (files) =>
        files?.every((f) => f.size <= MAX_FILE_SIZE)
      ),
  });

  // const handleBulkImportForm = async () => {
  //   for (const file of files) {
  //     if (!files || !files.length) return;
  //     const payload = new FormData();
  //     console.log(payload,"payload")

  //   const filesArray = Array.from(files);

  //   filesArray.forEach((file) => {
  //     payload.append("files", file, file.webkitRelativePath || file.name);
  //   });

  //     const response = await ApiUtils.AddFolderUpload(
  //       Url,
  //       payload,
  //       userDeviceId
  //     );

  //     if (!response?.data?.isSuccess) {
  //       ToasterMessage("error", "Upload failed");
  //       return;
  //     }
  //   }

  //   ToasterMessage("success", "Data added Successfully!");

  //   if (params) fetchData(params);
  //   else {
  //     if (setToDate) setToDate(new Date());
  //     fetchData();
  //   }

  //   setFiles([]);
  //   setDisplayItem(null);
  //   setOpenModal(false);
  // };
  const handleBulkImportForm = async (values, actions) => {
    try {
      if (!values.files || !values.files.length) return;

      const payload = new FormData();

      // âœ… Append ALL files ONCE
      values.files.forEach((file) => {
        payload.append("files", file, file.webkitRelativePath || file.name);
      });

      // âœ… SINGLE API CALL
      const response = await ApiUtils.AddFolderUpload(
        Url,
        payload,
        userDeviceId
      );

      if (!response?.data?.isSuccess) {
        ToasterMessage("error", "Upload failed");
        return;
      }

      ToasterMessage("success", "Data added Successfully!");

      // Refresh data
      if (params) fetchData(params);
      else {
        if (setToDate) setToDate(new Date());
        fetchData();
      }

      // Reset
      actions.resetForm();
      setFiles([]);
      setDisplayItem(null);
      setOpenModal(false);
    } catch (error) {
      ToasterMessage("error", "Something went wrong");
    } finally {
      actions.setSubmitting(false);
    }
  };

  useEffect(() => {
    setFiles([]);
    setDisplayItem(null);
  }, [open]);
  // 1ï¸âƒ£ Handle file selection
  const handleFileChange = (e) => {
    setFiles(e.target.files); // store selected files
  };
  return (
    <Modal open={open} onClose={() => setOpenModal(false)}>
      <Box sx={style}>
        <Formik
          innerRef={formikRef}
          initialValues={{ files: [] }}
          validationSchema={validationSchema}
          onSubmit={handleBulkImportForm}
        >
          {({ setFieldValue, errors, touched }) => {
            // DROPZONE HANDLER
            const onDrop = (acceptedFiles) => {
              if (!acceptedFiles.length) return;
              // Filter files according to uploadType
              const filteredFiles = acceptedFiles.filter((f) => {
                if (uploadType === "file")
                  return !f.webkitRelativePath.includes("/");
                if (uploadType === "folder")
                  return f.webkitRelativePath.includes("/");
                return true;
              });

              setFiles(filteredFiles);

              // Determine display name
              const isFolderUpload = filteredFiles.some(
                (f) =>
                  f.webkitRelativePath && f.webkitRelativePath.includes("/")
              );

              if (isFolderUpload) {
                // Get all folder names
                const folderNames = [
                  ...new Set(
                    acceptedFiles
                      .map((f) => f.webkitRelativePath?.split("/")[0])
                      .filter(Boolean)
                  ),
                ];

                setDisplayItem({
                  type: "folder",
                  name: folderNames.join(", "),
                });
              } else {
                setDisplayItem({
                  type: "file",
                  name: acceptedFiles.map((f) => f.name).join(", "),
                });
              }

              // Update parent/Formik
              setFieldValue("files", acceptedFiles, true);
            };

            const { getRootProps, getInputProps, isDragActive } = useDropzone({
              onDrop,
              multiple: true, // allow multiple files
              noClick: false,
              noKeyboard: false,
            });

            const handleRemove = () => {
              setFiles([]);
              setDisplayItem(null);
              setFieldValue("files", [], true);
            };

            return (
              <Form>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h3">{title}</Typography>
                  <IconButton onClick={() => setOpenModal(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>

                {/* Radio buttons to choose upload type */}
                <Box mb={2}  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 2,
                  }}>
                  <RadioGroup
                    row
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                  >
                    <FormControlLabel
                      value="file"
                      control={<Radio />}
                      label="File Only"
                    />
                    <FormControlLabel
                      value="folder"
                      control={<Radio />}
                      label="Folder Only"
                    />
                  </RadioGroup>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} lg={6} mx="auto">
                    <Box
                      {...getRootProps()}
                      sx={{
                        border: "2px dashed #1976d2",
                        borderRadius: "8px",
                        padding: "20px",
                        textAlign: "center",
                        backgroundColor: isDragActive ? "#f0f8ff" : "#fafafa",
                        cursor: "pointer",
                        mb: 3,
                      }}
                    >
                      {/* Enable folder upload */}
                      {/* <input
                        {...getInputProps()}
                        webkitdirectory="true"
                        directory=""
                      /> */}

                      <input
                        {...getInputProps()}
                        {...(uploadType === "folder"
                          ? { webkitdirectory: "true", directory: "" }
                          : {})}
                      />

                      <Typography variant="h6">
                        Drag & drop a file or folder, or click to upload
                      </Typography>

                      {errors.files && touched.files && (
                        <Typography color="error" variant="caption">
                          {errors.files}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {displayItem && (
                    <Grid item xs={12} lg={6} mx="auto">
                      <Box
                        sx={{
                          p: 1,
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        <Typography
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          {displayItem.name}
                          <Button
                            color="error"
                            size="small"
                            onClick={handleRemove}
                          >
                            <FaTrash />
                          </Button>
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Box textAlign="center">
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={!displayItem}
                      >
                        Submit
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Modal>
  );
};

export default CommonFolderUploadModal;
