import React, { useEffect, useRef, useState } from "react";
import MainCard from "ui-component/cards/MainCard";
import Box from "@mui/material/Box";
import CustomDataGridTable from "helper/CustomDataGridTable";
import Modal from "@mui/material/Modal";
import {
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  RadioGroup,
  Radio,
  FormLabel,
  FormControlLabel,
  FormHelperText,
  Switch,
} from "@mui/material";
import Swal from "sweetalert2";

import CloseIcon from "@mui/icons-material/Close";
import ApiUtils from "api/ApiUtils";
import { Link } from "react-router-dom";
import { GridActionsCellItem } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useFetchData } from "helper/useFetchData";
import { GET_ALL_DEVICE_USER } from "config/ApiNameConstant";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import { format } from "prettier";
import useScriptRef from "hooks/useScriptRef";
import { margin } from "@mui/system";
import { FaPenToSquare, FaTrash } from "react-icons/fa6";
import { ToasterMessage } from "helper/ToasterHelper";

function ListOfDevices() {
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
  const formikRef = useRef(); // Create a reference for Formik
  const updatePasswordRef = useRef(); // Create a reference for Formik

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [cardDetailsData, setCardDetailsData] = useState([]);
  const params = `Page=${currentPageNumber}&PageSize=${10}`;
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const [openUserModal, setOpenUserModal] = React.useState(false);
  const handleCloseUserModal = () => setOpenUserModal(false);
  const [initialValuesUsers, setInitialValuesUsers] = useState({
    userName: "",
    userEmail: "",
    deviceName: "",
    model: "",
    os: "",
    version: "",
    imeiNumber: "",
    isConnectedWithWifi: "",
    batteryPercentage: "",
  });

  const editModal = (data) => {
    const params = `DeviceUserId=${data?.deviceUserId}`;
    ApiUtils.getDeviceInfo(params)
      .then((res) => {
        setInitialValuesUsers({
          userName: data?.name ?? "",
          userEmail: data?.email ?? "",
          deviceName: res?.data?.data?.deviceName ?? "",
          model: res?.data?.data?.model ?? "",
          os: res?.data?.data?.os ?? "",
          version: res?.data?.data?.version ?? "",
          imeiNumber: res?.data?.data?.imeiNumber ?? "",
          isConnectedWithWifi: res?.data?.data?.isConnectedWithWifi ? "1" : "2",
          batteryPercentage: res?.data?.data?.batteryPerc ?? "",
          deviceUserId: data?.deviceUserId,
        });

        setOpenUserModal(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deletedData = async (data) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        // Perform delete logic here
        ApiUtils.deleteUserAll(data)
          .then((res) => {
            if (res?.data?.isSuccess == true) {
              fetchData();
              Swal.fire("Deleted!", "Your item has been deleted.", "success");
            }
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error", "There was an issue while deleting.", "error");
          });
      } else {
        Swal.fire("Cancelled", "Your data is safe", "info");
      }
    } catch (error) {
      console.error("Error during the delete confirmation:", error);
    }
  };

  const { totalCount, data, fetchData } = useFetchData(
    GET_ALL_DEVICE_USER,
    params,
    currentPageNumber
  );
  const scriptedRef = useScriptRef();
  const showCardsListModal = (param) => {
    // const paramsForCardDetails = `DeviceUserId=${
    //   param.row.deviceUserId
    // }&Page=${1}&PageSize=${10}`;
    // ApiUtils.getUserCardDetails(paramsForCardDetails)
    //   .then((res) => {
    //     const dataTable = res.data.data.listResponse.map((data, index) => ({
    //       ...data,
    //       id: index + 1,
    //     }));
    //     setCardDetailsData(dataTable);
    //   })
    //   .catch((err) => {
    //     console.log("🚀 ~ file: Dashboard.tsx:39 ~ ).then ~ err:", err);
    //   });
    setOpen(true);
  };
  const columns = [
    {
      field: "phoneId",
      headerName: "PhoneId",
      flex: 1,
      renderCell: (params) => (
        <Link
          to={`/user/device-info/${params?.row?.deviceUserId}`}
          className="link-redirect"
        >
          {params?.row?.phoneId}
        </Link>
      ),
    },
    { field: "name", headerName: "Name", flex: 1 },
    // { field: "cnic", headerName: "CNIC", flex: 1 },
    // { field: "number", headerName: "Number", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "createdDate", headerName: "Created At", flex: 1 },
    { field: "password", headerName: "Password", flex: 1 },

    // {
    //   field: "actions",
    //   headerName: "Open Card",
    //   type: "actions",
    //   flex: 1,
    //   getActions: (params) => [
    //     <GridActionsCellItem
    //       icon={<VisibilityIcon />}
    //       label="map"
    //       onClick={() => showCardsListModal(params)}
    //     />,
    //   ],
    // },
    // {
    //   field: "isActive",
    //   headerName: "Active",
    //   flex: 1,
    //   valueGetter: (params) => {
    //     return params.row.status === "Active"
    //       ? "Active"
    //       : params.row.status === "ParitalActive"
    //       ? "Paritally Active"
    //       : "Inactive";
    //   },
    // },
    {
    field: "status",
    headerName: "Active",
    flex: 1,
    renderCell: (params) => {
      const isActive = params.row.status === "Active";

      const handleToggle = async (event) => {
        const newStatus = event.target.checked ? 2 : 3; 
        // Active = 2, Inactive = 3 (based on your enum)

        try {
          const res = await ApiUtils.updateDeviceStatus({
            deviceUserId: params?.row?.deviceUserId,
            status: newStatus,
          });

          if (res?.data?.isSuccess) {
            fetchData();
            Swal.fire(
              "Updated!",
              `Device is now ${event.target.checked ? "Inactive" : "Active"}.`,
              "success"
            );
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "There was an issue updating status.", "error");
        }
      };

      return (
        <Switch
          checked={isActive}
          onChange={handleToggle}
          color="primary"
        />
      );
    },
  },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      type: "actions",
      renderCell: (params) => (
        <div>
          <Button
            className="link-redirect"
            onClick={() => {
              editModal(params?.row);
            }}
          >
            <FaPenToSquare stroke={2} />
          </Button>
          <Button className="link-redirect">
            <FaTrash
              stroke={2}
              onClick={() => {
                deletedData(params?.row?.deviceUserId);
              }}
            />
          </Button>
        </div>
      ),
    },
  ];
  const columnsOfCardsList = [
    {
      field: "nameOnCard",
      headerName: "Name on Card",
      flex: 1,
      sortable: false,
    },
    {
      field: "cardNumber",
      headerName: "Card Number",
      flex: 1,
      sortable: false,
    },
    {
      field: "expiryDate",
      headerName: "Expiry Date",
      flex: 1,
      sortable: false,
    },
    { field: "cvv", headerName: "CVV", flex: 1, sortable: false },
  ];
  const handlePaginationModelChange = (page) => {
    setCurrentPageNumber(page.page + 1);
    setPaginationModel({
      ...paginationModel,
      page: page.page,
    });
  };

  const initialValues = {
    username: "",
    password: "",
  };
  // Validation Schema using Yup
  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const handleSubmitForm = async (formData) => {
    const payload = {
      // oldUserName: "ratuser1339@gmail.com",
      newUserName: formData.username,
      password: formData.password,
    };
    try {
      const response = await ApiUtils.setAdminCredentials(payload);
      if (response.data.isSuccess === true) {
        ToasterMessage("success", "Updated Successfully!");
      } else {
        ToasterMessage("error", response?.data?.message);
      }
    } catch (err) {
      if (scriptedRef.current) {
        ToasterMessage("error", response?.data?.message);
      }
    }
    setOpen(false);
    // Add your form submission logic here
  };

  // add user form validation and submit

  // Validation Schema using Yup
  const validationSchemaUsers = Yup.object({
    userName: Yup.string().required("User Name is required"),
    userEmail: Yup.string()
      .email("Please enter a valid email address")
      .required("User Email is required"),
    deviceName: Yup.string().required("Device Name is required"),
    model: Yup.string().required("Model is required"),
    os: Yup.string().required("OS is required"),
    version: Yup.string().required("Version  Id is required"),
    imeiNumber: Yup.string().required("INEI Number is required"),
    isConnectedWithWifi: Yup.string()
      .required("Is Connected With Wifi is required")
      .oneOf(["1", "2"]),

    batteryPercentage: Yup.number()
      .min(0, "Must be greater than or equal to 0")
      .max(100, "Must be less than or equal to 100")
      .required("Battery Percentage is required"),
  });

  const handleUserSubmitForm = async (formData) => {
    const payload = {
      name: formData?.userName,
      email: formData?.userEmail,
      deviceName: formData.deviceName,
      model: formData.model,
      os: formData.os,
      version: formData.version,
      imeiNumber: formData.imeiNumber,
      isConnectedWithWifi: formData.isConnectedWithWifi == "1" ? true : false,
      batteryPercentage: Number(formData.batteryPercentage),
    };

    try {
      const response = formData?.deviceUserId
        ? await ApiUtils.updateUserAll(payload, formData?.deviceUserId)
        : await ApiUtils.addUserAll(payload);
      if (response.data.isSuccess === true) {
        fetchData();
        ToasterMessage("success", "User device Successfully!");
      } else {
        ToasterMessage("error", response?.data?.message);
      }
      setOpenUserModal(false);
    } catch (err) {
      if (scriptedRef.current) {
        // ToasterMessage("error", response?.data?.message);
      } else {
        ToasterMessage("error", err?.data?.message);
      }
    }

    // Add your form submission logic here
  };

  return (
    <>
      <MainCard
        title={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h3">List of Device Users</Typography>

            <div>
              <Button
                variant="contained"
                color="primary"
                sx={{ marginX: "5px" }}
                onClick={() => showCardsListModal({ deviceUserId: 1 })}
              >
                Update Admin
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ marginX: "5px" }}
                onClick={() => {
                  setInitialValuesUsers({
                    userName: "",
                    userEmail: "",
                    deviceName: "",
                    model: "",
                    os: "",
                    version: "",
                    imeiNumber: "",
                    isConnectedWithWifi: "",
                    batteryPercentage: "",
                  });
                  setOpenUserModal(true);
                }}
              >
                Add User
              </Button>
            </div>
          </Box>
        }
      >
        <Box
          sx={{
            py: 2,
            width: "100%",
            overflowX: "hidden",
            borderBottom: "none",
            height: "500px",
          }}
        >
          <CustomDataGridTable
            columns={columns}
            rows={data}
            pagination={true}
            hideFooter={false}
            rowCount={totalCount}
            onPaginationModelChange={handlePaginationModelChange}
            paginationModel={paginationModel}
          />
        </Box>
      </MainCard>
      {/* <Modal
        keepMounted
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: "15px",
            }}
          >
            <Typography id="modal-modal-title" variant="h2" component="h2">
              Cards List
            </Typography>
            <CloseIcon className="close-icon-modal" onClick={handleClose} />
          </Box>

          <Grid item xs={12}>
            
            <Box
              sx={{
                py: 2,
                width: "100%",
                overflowX: "hidden",
                borderBottom: "none",
                height: "450px",
                overflowY: "auto",
              }}
            >
              <CustomDataGridTable
                columns={columnsOfCardsList}
                rows={cardDetailsData}
                hideFooter={true}
                rowCount={0}
              />
            </Box>
          </Grid>
        </Box>
      </Modal> */}
      <Modal
        keepMounted
        open={open}
        onClose={() => {
          updatePasswordRef.current?.resetForm();
          handleClose();
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: "15px",
            }}
          >
            <Typography id="modal-modal-title" variant="h2" component="h2">
              Update Admin Access
            </Typography>
            <CloseIcon
              className="close-icon-modal"
              onClick={() => {
                updatePasswordRef.current?.resetForm();
                handleClose();
              }}
            />
          </Box>

          <Grid item xs={12}>
            <Formik
              innerRef={updatePasswordRef}
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                handleSubmitForm(values);
                updatePasswordRef.current?.resetForm();
              }}
            >
              {({ errors, touched }) => (
                <Form>
                  <Field
                    as={TextField}
                    name="username"
                    label="Username"
                    fullWidth
                    margin="normal"
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                  />
                  <Field
                    as={TextField}
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Submit
                  </Button>
                </Form>
              )}
            </Formik>
          </Grid>
        </Box>
      </Modal>

      {/* add user modal  */}

      <Modal
        keepMounted
        open={openUserModal}
        onClose={() => {
          formikRef.current?.resetForm(); // Resetting the form state on modal close
          handleCloseUserModal();
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Formik
            innerRef={formikRef}
            initialValues={initialValuesUsers}
            validationSchema={validationSchemaUsers}
            enableReinitialize={true} // Ensure Formik reinitializes when initialValuesUsers changes
            onSubmit={(values) => {
              handleUserSubmitForm(values);
            }}
          >
            {({ errors, touched, values, handleChange }) => (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: "15px",
                  }}
                >
                  <Typography
                    id="modal-modal-title"
                    variant="h2"
                    component="h2"
                  >
                    {initialValuesUsers?.deviceUserId
                      ? "Edit Device User"
                      : "Add Device User"}
                  </Typography>
                  <CloseIcon
                    className="close-icon-modal"
                    onClick={() => {
                      formikRef.current?.resetForm(); // Resetting the form state on modal close
                      handleCloseUserModal();
                    }}
                  />
                </Box>
                <Form>
                  <Grid container spacing={1}>
                    <Grid item xs={12} lg={6}>
                      <input
                        name="deviceUserId"
                        type="hidden"
                        value={
                          initialValuesUsers?.deviceUserId
                            ? initialValuesUsers?.deviceUserId
                            : ""
                        }
                      />

                      <Field
                        as={TextField}
                        name="userName"
                        label="User Name"
                        type="text"
                        fullWidth
                        margin="normal"
                        error={touched.userName && Boolean(errors.userName)}
                        helperText={touched.userName && errors.userName}
                      />
                      <Field
                        as={TextField}
                        name="deviceName"
                        label="Device Name"
                        type="text"
                        fullWidth
                        margin="normal"
                        error={touched.deviceName && Boolean(errors.deviceName)}
                        helperText={touched.deviceName && errors.deviceName}
                      />
                      <Field
                        as={TextField}
                        name="model"
                        label="Model"
                        fullWidth
                        margin="normal"
                        error={touched.model && Boolean(errors.model)}
                        helperText={touched.model && errors.model}
                      />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                      <Field
                        as={TextField}
                        name="userEmail"
                        label="User Email"
                        type="text"
                        fullWidth
                        margin="normal"
                        error={touched.userEmail && Boolean(errors.userEmail)}
                        helperText={touched.userEmail && errors.userEmail}
                      />
                      <Field
                        as={TextField}
                        name="version"
                        label="Version"
                        fullWidth
                        margin="normal"
                        error={touched.version && Boolean(errors.version)}
                        helperText={touched.version && errors.version}
                      />
                      <Field
                        as={TextField}
                        name="os"
                        label="OS"
                        type="text"
                        fullWidth
                        margin="normal"
                        error={touched.os && Boolean(errors.os)}
                        helperText={touched.os && errors.os}
                      />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                      <Field
                        as={TextField}
                        name="batteryPercentage"
                        label="Battery Percentage"
                        type="number"
                        fullWidth
                        margin="normal"
                        error={
                          touched.batteryPercentage &&
                          Boolean(errors.batteryPercentage)
                        }
                        helperText={
                          touched.batteryPercentage && errors.batteryPercentage
                        }
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          ); // Allow only digits
                        }}
                      />
                      <FormControl sx={{ margin: "15px" }}>
                        <FormLabel id="demo-radio-buttons-group-label">
                          Is Connected With Wifi
                        </FormLabel>
                        <RadioGroup
                          aria-labelledby="demo-radio-buttons-group-label"
                          value={values.isConnectedWithWifi}
                          name="isConnectedWithWifi"
                          onChange={handleChange}
                          row
                        >
                          <FormControlLabel
                            value="1"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="2"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                        {touched.isConnectedWithWifi &&
                          errors.isConnectedWithWifi && (
                            <FormHelperText error>
                              {errors.isConnectedWithWifi}
                            </FormHelperText>
                          )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                      <Field
                        as={TextField}
                        name="imeiNumber"
                        label="IMEI Number"
                        type="text"
                        fullWidth
                        margin="normal"
                        error={touched.imeiNumber && Boolean(errors.imeiNumber)}
                        helperText={touched.imeiNumber && errors.imeiNumber}
                      />
                    </Grid>

                    <Grid
                      container
                      direction="row"
                      sx={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Grid item xs={12} lg={4}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          sx={{ mt: 2 }}
                          fullWidth
                        >
                          {initialValuesUsers?.deviceUserId ? "Update" : "Add"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Form>
              </>
            )}
          </Formik>
        </Box>
      </Modal>
    </>
  );
}

export default ListOfDevices;
