import React, { useState } from "react";
import {
  Box,
  Button,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import Modal from "@mui/material/Modal";
import { GridActionsCellItem } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import MainCard from "ui-component/cards/MainCard";
import CustomDataGridTable from "helper/CustomDataGridTable";
import { useFetchData } from "helper/useFetchData";
import { GET_NOTES_LOGS } from "config/ApiNameConstant";
import { getParamUrl } from "helper/UrlHelper";
import { extractDate, extractTime } from "helper/GetDateTimeFormat";
import { gridSpacing } from "store/constant";
import ApiUtils from "api/ApiUtils";
import { ToasterMessage } from "helper/ToasterHelper";
import { useDevice } from "contexts/DeviceContext";
import CommonModal from "views/CommonModal";

const validationSchema = Yup.object({
  title: Yup.string().max(50, "Max 50 characters").required("Title is required"),
  content: Yup.string().max(1500, "Max 1500 characters").required("Content is required"),
});

const Notes = () => {
  const urlParam = useParams();
  const userDeviceIdAsNumber = urlParam.userDeviceId;
  const { deviceData } = useDevice();
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openExcelModal, setOpenExcelModal] = useState(false);
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const [open, setOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const handleClose = () => setOpen(false);
  const showNoteModal = (params) => {
    setSelectedNote(params.row);
    setOpen(true);
  };

  const params = getParamUrl(null, userDeviceIdAsNumber, currentPageNumber);
  const { totalCount, data, fetchData } = useFetchData(
    GET_NOTES_LOGS,
    params,
    currentPageNumber
  );

  const handlePaginationModelChange = (page) => {
    setCurrentPageNumber(page.page + 1);
    setPaginationModel({
      ...paginationModel,
      page: page.page,
    });
  };

  const handleAddNote = async (values, { resetForm }) => {
    try {
      await ApiUtils.AddNote(
        {
          title: values.title,
          content: values.content,
        },
        deviceData?.imeiNumber
      );
      ToasterMessage("success", "Note added successfully!");
      fetchData(params);
      resetForm();
      setOpenAddModal(false);
    } catch (err) {
      ToasterMessage("error", err?.data?.message || "Something went wrong");
    }
  };

  const columns = [
    { field: "title", headerName: "Title", flex: 1 },
    { field: "content", headerName: "Content", flex: 2 },
    {
      field: "time",
      headerName: "Time",
      flex: 1,
      valueGetter: (params) => extractTime(params.row.logDateTime),
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      valueGetter: (params) => extractDate(params.row.logDateTime),
    },
    {
      field: "actions",
      headerName: "View",
      type: "actions",
      flex: 1,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<RemoveRedEyeIcon />}
          label="view"
          onClick={() => showNoteModal(params)}
        />,
      ],
    },
  ];

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "12px",
    p: 4,
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <MainCard content={false} title="Notes">
          <Button
            sx={{ float: "right", mr: 2, mt: 2 }}
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setOpenAddModal(true)}
          >
            Add Note
          </Button>
          <Button
            sx={{ float: "right", mr: 2, mt: 2 }}
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => setOpenExcelModal(true)}
          >
            Upload Excel
          </Button>
          <CardContent>
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
          </CardContent>
        </MainCard>
      </Grid>

      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} fullWidth maxWidth="sm">
        <Formik
          initialValues={{ title: "", content: "" }}
          validationSchema={validationSchema}
          onSubmit={handleAddNote}
        >
          {({ errors, touched, values, handleChange, handleBlur }) => (
            <Form>
              <DialogTitle>Add Note</DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(errors.title && touched.title)}
                      helperText={touched.title && errors.title}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Content"
                      name="content"
                      value={values.content}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(errors.content && touched.content)}
                      helperText={touched.content && errors.content}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <CommonModal
        userDeviceId={userDeviceIdAsNumber}
        open={openExcelModal}
        setOpenExcelModal={setOpenExcelModal}
        title="Notes Import"
        fetchData={fetchData}
        Url="Notes/BulkImport"
        params={params}
      />

      <Modal
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
              {selectedNote?.title}
            </Typography>
            <CloseIcon className="close-icon-modal" onClick={handleClose} />
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Typography sx={{ whiteSpace: "pre-wrap", mt: 2 }}>
            {selectedNote?.content}
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="caption" color="textSecondary">
            {extractDate(selectedNote?.logDateTime)} {extractTime(selectedNote?.logDateTime)}
          </Typography>
        </Box>
      </Modal>
    </Grid>
  );
};

export default Notes;
