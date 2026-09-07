import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Modal,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import useScriptRef from "hooks/useScriptRef";
import ApiUtils from "api/ApiUtils";
import { ToasterMessage } from "helper/ToasterHelper";
import { useDropzone } from "react-dropzone";

const CommonModal = ({
  userDeviceId,
  open,
  title,
  setOpenExcelModal,
  fetchData,
  Url,
  params = "",
  setToDate = "",
  isScheduleEnabled = false,
  fileType=0,
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

  // Validation Schema using Yup
  const validationSchemaExcel = Yup.object({
    excelFile: Yup.mixed()
      .required("Excel file is required")
      .test(
        "fileType",
        "Only Excel file are allowed (xls, xlsx)",
        (value) =>
          value &&
          value.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ),
    isScheduled: Yup.boolean(),                          
    scheduledAt: Yup.string().when("isScheduled", {
  is: true,
  then: (schema) =>
    schema
      .required("Please select a date and time")
      .test(
        "min-5-minutes",
        "Scheduled time must be at least 5 minutes from now",
        (value) => {
          if (!value) return false;

          const now = new Date();
          now.setSeconds(0, 0);

          const minTime = new Date(now.getTime() + 6 * 60 * 1000);

          const selectedTime = new Date(value);

          return selectedTime >= minTime;
        }
      ),
  otherwise: (schema) => schema.notRequired(),
}),
  });

  // handle bulk import API
  const handleBulkImportForm = async (formData) => {
    const payload = new FormData();
    payload.append("file", formData["excelFile"]);

    try {
      const response = await ApiUtils.AddBulkImport(Url, payload, userDeviceId);

      if (response?.data === true) {
        ToasterMessage("success", "Data added Successfully!");

        if (params != "") {
          fetchData(params);
        } else {
          if (setToDate) {
            setToDate(new Date());
          }
          fetchData();
        }
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
    setOpenExcelModal(false);
    // Add your form submission logic here
  };

  const getNowLocal = () => {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const handleScheduledImportForm = async (formData) => {
  
  const payload = new FormData();
  payload.append("File", formData["excelFile"]);

  try {
    const response = await ApiUtils.scheduledExcelUpload(payload, userDeviceId, formData["scheduledAt"],fileType);  
    if (response?.data?.isSuccess === true) {
      ToasterMessage("success", "Upload scheduled successfully!");
    } else {
      ToasterMessage("error", response?.data?.message || "Something went wrong");
    }
  } catch (err) {
    if (scriptedRef.current) {
      ToasterMessage("error", err?.response?.data?.message);
    } else {
      ToasterMessage("error", err?.statusText);
    }
  }
  setOpenExcelModal(false);
};

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
          initialValues={{ excelFile: null , isScheduled: false, scheduledAt: "" }}
          validationSchema={validationSchemaExcel}
          enableReinitialize={true}
          onSubmit={async (values, { resetForm }) => {
            if (values.isScheduled) {
              handleScheduledImportForm(values);
            } else {
              handleBulkImportForm(values);   
            }
            await resetForm();
          }}
        >
          {({ errors, touched, setFieldValue, values, resetForm }) => {
            // React Dropzone for drag-and-drop file upload
            const onDrop = (acceptedFiles) => {
              if (acceptedFiles.length > 0) {
                setFieldValue("excelFile", acceptedFiles[0]);
              }
            };

            const { getRootProps, getInputProps, isDragActive } = useDropzone({
              onDrop,
              multiple: false,
              accept: {
                "application/vnd.ms-excel": [".xls", ".xlsx"],
              },
            });
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

                 {isScheduleEnabled && (
                  <Grid item xs={12} lg={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.isScheduled}
                          onChange={(e) => {
                            setFieldValue("isScheduled", e.target.checked);
                            if (!e.target.checked) setFieldValue("scheduledAt", "");
                          }}
                          color="primary"
                        />
                      }
                      label={<Typography variant="body1" fontWeight={500}>Schedule Upload</Typography>}
                    />
                  </Grid>)}
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
                      }}
                    >
                      <input {...getInputProps()} />
                      <Typography variant="h6" color="textPrimary">
                        {isDragActive
                          ? "Drop the file here..."
                          : "Drag and drop a file here, or click to upload"}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Only Excel file (.xls, .xlsx) are supported.
                      </Typography>

                      {/* Show File Preview */}
                      {values.excelFile && (
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
                          <Typography variant="subtitle1" color="textPrimary">
                            Uploaded File:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>File Name:</strong> {values.excelFile.name}
                          </Typography>
                          {/* <Typography variant="body2" color="textSecondary">
                            <strong>File Size:</strong>{" "}
                            {(values.excelFile.size / 1024).toFixed(2)} KB
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>File Type:</strong> {values.excelFile.type}
                          </Typography> */}
                        </Box>
                      )}
                      {errors.excelFile && touched.excelFile && (
                        <Typography color="error" variant="caption">
                          {errors.excelFile}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* Schedule Upload Switch */}
                  <Grid
                    item
                    xs={12}
                    lg={3}
                    sx={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  ></Grid>
                  

                  {values.isScheduled && (
                    <>
                      <Grid item xs={12} lg={3} />
                      <Grid item xs={12} lg={6}>
                        <TextField
                          label="Schedule Date & Time"
                          type="datetime-local"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: getNowLocal() }}
                          value={values.scheduledAt}
                          onChange={(e) => setFieldValue("scheduledAt", e.target.value)}
                          error={Boolean(errors.scheduledAt && touched.scheduledAt)}
                          helperText={
                            errors.scheduledAt && touched.scheduledAt
                              ? errors.scheduledAt
                              : "Select today or a future date and time"
                          }
                        />
                      </Grid>
                    </>
                  )}

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
                        {values.isScheduled ? "Schedule" : "Submit"}
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

export default CommonModal;
