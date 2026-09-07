import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Modal,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import useScriptRef from "hooks/useScriptRef";
import ApiUtils from "api/ApiUtils";
import { ToasterMessage } from "helper/ToasterHelper";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";

const CommonImageModal = ({
  userDeviceId,
  open,
  title,
  setOpenExcelModal,
  fetchData,
  Url,
  params = "",
  setToDate = "",
  type = "",
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
  const scriptedRef = useScriptRef();

  // add import excel file data form validation and submit
  const [files, setFiles] = useState([]);

  // const { imeiNumber } = useSelector((state) => state.deviceData);
  const imeiNumber = localStorage.getItem("imeiNumber");
  const imageTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
  ];
  const videoTypes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/mpeg",
    "video/quicktime",
  ];
  const validTypes = type === "image" ? imageTypes : videoTypes;
  const validMsg =
    type === "image" ? "Only image file support" : " Only videos file support";
  // Validation Schema using Yup
  const validationSchemaExcel = Yup.object({
    // files: Yup.array()
    //   .min(1, "Please upload at least one file.") // At least one file is required
    //   .of(
    //     Yup.mixed().test(
    //       "fileType",
    //       validMsg,
    //       (value) => value && validTypes.includes(value.type)
    //     )
    //   ),
    files: Yup.array()
      .min(1, "Please upload at least one file.") // Ensure at least one file is uploaded
      .test("allValidFiles", validMsg, (files) => {
        if (!files || files.length === 0) return false;

        // Validate all files
        const allValid = files.every((file) => validTypes.includes(file.type));

        return allValid; // Only return true if all files pass the validation
      }),
  });

  // handle bulk import API
  const handleBulkImportForm = async () => {
    files.map(async (item, key) => {
      try {
        const payload = new FormData();
        payload.append("files", item);
        const response = await ApiUtils.AddBulkImage(Url, payload, imeiNumber);

        if (response?.data?.isSuccess === true) {
          ToasterMessage("success", "Data added Successfully!");

          if (params != "") {
            fetchData(params);
          } else {
            if (setToDate) {
              setToDate(new Date());
            }
            fetchData();
          }
          setFiles([]);
        } else {
          ToasterMessage("error", "Something went wrong");
        }
      } catch (err) {
        if (scriptedRef.current) {
          ToasterMessage("error", response?.data?.message);
        } else {
          ToasterMessage("error", err?.statusText);
        }
      }
    });

    setOpenExcelModal(false);
    // Add your form submission logic here
  };
  // const handleRemove = (index) => {
  //   const updatedFiles = files.filter((_, i) => i !== index);

  //   setFiles(updatedFiles);
  //   setFieldValue("files", updatedFiles);
  // };
  useEffect(() => {
    setFiles([]);
  }, [open]);
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file));
      // values.files.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [files]);
  return (
    <Modal
      keepMounted
      open={open}
      onClose={() => {
        if (formikRef.current) {
          formikRef.current.resetForm(); // Reset the form
        }
        setOpenExcelModal(false);
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Formik
          innerRef={formikRef}
          initialValues={{ files: [] }}
          validationSchema={validationSchemaExcel}
          enableReinitialize={true}
          onSubmit={async (values, { resetForm }) => {
            handleBulkImportForm();
            await resetForm(); // Reset form after submission
          }}
        >
          {({ errors, touched, setFieldValue, values, resetForm }) => {
            // React Dropzone for drag-and-drop file upload
            const onDrop = (acceptedFiles) => {
              if (acceptedFiles.length > 0) {
                setFieldValue("files", [...files, ...acceptedFiles]);

                // Merge previous files with the new files
                setFiles((prev) => [...prev, ...acceptedFiles]);
              }
            };

            const { getRootProps, getInputProps, isDragActive } = useDropzone({
              onDrop,
              multiple: true,
              accept: type === "image" ? { "image/*": [] } : { "video/*": [] },
            });
            const handleRemove = (index) => {
              const updatedFiles = files.filter((_, i) => i !== index);

              setFiles(updatedFiles);
              setFieldValue("files", updatedFiles);
            };
            return (
              <Form>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: "15px",
                  }}
                >
                  <Typography variant="h3">{title}</Typography>
                  <IconButton
                    onClick={() => {
                      resetForm();
                      setOpenExcelModal(false);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  {/* Drag-and-Drop File Upload */}
                  <Grid
                    item
                    xs={12}
                    lg={3}
                    sx={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  ></Grid>
                  <Grid
                    item
                    xs={12}
                    lg={6}
                    sx={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      {...getRootProps()}
                      sx={{
                        border: "2px dashed #1976d2",
                        borderRadius: "8px",
                        padding: "20px",
                        textAlign: "center",
                        backgroundColor: isDragActive ? "#f0f8ff" : "#fafafa",
                        transition: "background-color 0.3s",
                        cursor: "pointer",
                        ":hover": {
                          backgroundColor: "#f5f5f5",
                        },
                        marginBottom: "40px",
                      }}
                    >
                      <input {...getInputProps()} />
                      <Typography variant="h6" color="textPrimary">
                        {isDragActive
                          ? "Drop the file here..."
                          : "Drag and drop a file here, or click to upload"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                      ></Typography>

                      {errors.files && touched.files && (
                        <Typography color="error" variant="caption">
                          {errors.files}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* Show File Preview */}

                  <Grid
                    container
                    spacing={2}
                    mb={2}
                    sx={{
                      maxHeight: "500px", // Adjust height as needed
                      overflowY: "auto", // Enable vertical scrolling
                    }}
                  >
                    {files && files.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" color="textPrimary">
                          Uploaded Files:
                        </Typography>
                      </Grid>
                    )}

                    {files &&
                      files?.map((item, key) => (
                        <Grid key={key} item xs={12} lg={6}>
                          <Box
                            sx={{
                              mt: 2,
                              p: 1,
                              border: "1px solid #ddd",
                              borderRadius: "8px",
                              backgroundColor: "#f9f9f9",
                              textAlign: "left",
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              {item.name}

                              {/* Render image or video based on file type */}
                              {item.type.startsWith("image/") ? (
                                <img
                                  src={URL.createObjectURL(item)}
                                  alt={item.name}
                                  style={{
                                    maxWidth: "20%",
                                    maxHeight: "20%",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    marginTop: "8px",
                                  }}
                                />
                              ) : item.type.startsWith("video/") ? (
                                <video
                                  src={URL.createObjectURL(item)}
                                  controls
                                  style={{
                                    maxWidth: "20%",
                                    maxHeight: "20%",
                                    borderRadius: "4px",
                                    marginTop: "8px",
                                  }}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <Typography variant="body2" color="error">
                                  Unsupported file type
                                </Typography>
                              )}

                              {/* Remove Button */}
                              <Button
                                color="error"
                                size="small"
                                onClick={() => handleRemove(key)}
                              >
                                <FaTrash />
                              </Button>
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                  </Grid>
                  {/* Submit Button */}

                  <Grid item xs={12} lg={12}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center", // Centers the button horizontally
                      }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{
                          width: "auto", // Ensures the button width adjusts to its content
                          px: 5, // Adds some horizontal padding for better appearance
                        }}
                      >
                        Submit
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            );
          }}
          {/* drag n drop code finished here  */}
        </Formik>
      </Box>
    </Modal>
  );
};

export default CommonImageModal;
