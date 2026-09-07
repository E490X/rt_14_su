import React, { useState } from "react";
import Box from "@mui/material/Box";
import { useParams } from "react-router-dom";
import { Grid, CardContent, Checkbox, Button, Chip, Typography, IconButton, DialogActions, TextField, DialogTitle, Dialog, DialogContent } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import CustomDataGridTable from "helper/CustomDataGridTable";
import { useFetchData } from "helper/useFetchData";
import { GET_MANAGE_UPLOADS_LOGS } from "config/ApiNameConstant";
import CommonDeleteModal from "views/CommonDeleteModal";
import useCommonCheckbox from "views/useCommonCheckbox";
import { FaPenToSquare, FaTrash } from "react-icons/fa6";
import ApiUtils from "api/ApiUtils";
import { getParamUrl } from "helper/UrlHelper";
import { extractDate, extractTime } from "helper/GetDateTimeFormat";
import { Download } from "@mui/icons-material";
import { toast } from "react-toastify";

const getStatusLabel = (status) => {
  switch (status) {
    case 1:
      return (
        <Chip
          label="Pending"
          size="small"
          sx={{ backgroundColor: "#FFF3E0", color: "#E65100", fontWeight: 600, borderRadius: "6px" }}
        />
      );
    case 2:
      return (
        <Chip
          label="In Progress"
          size="small"
          sx={{ backgroundColor: "#E3F2FD", color: "#1565C0", fontWeight: 600, borderRadius: "6px" }}
        />
      );
    case 3:
      return (
        <Chip
          label="Completed"
          size="small"
          sx={{ backgroundColor: "#E8F5E9", color: "#2E7D32", fontWeight: 600, borderRadius: "6px" }}
        />
      );
    case 4:
    return (
      <Chip
        label="Failed"
        size="small"
        sx={{backgroundColor: "#FFEBEE", color: "#C62828", fontWeight: 600, borderRadius: "6px" }}
      />
    );
    default:
      return <Chip label="Unknown" size="small" />;
  }
};

const ManageUploads = () => {
  const urlParam = useParams();
  const userDeviceIdAsNumber = urlParam.userDeviceId;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [filterModel, setFilterModel] = useState({
    fromDate: "",
    toDate: "",
  });

  let params = getParamUrl(filterModel, userDeviceIdAsNumber, currentPageNumber);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editDateTime, setEditDateTime] = useState("");
  const [dateError, setDateError] = useState("");

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  const FILE_TYPE_MAP = {
  1: "Whatsapp",
  2: "Skype",
  3: "Tinder",
  4: "Viber",
  5: "Kik",
  6: "Line",
  7: "Location",
  8: "Signal",
  9: "Facebook",
  10: "Call Logs"
};


  const { totalCount, data, fetchData } = useFetchData(
    GET_MANAGE_UPLOADS_LOGS,
    params,
    currentPageNumber
  );

  const {
    setParentChecked,
    setChildCheckedState,
  } = useCommonCheckbox(data, "fileId");

  const handleEditOpen = (row) => {
    setSelectedRow(row);
    setEditDateTime(row.scheduledTime);
    setOpenEditModal(true);
  };

  const handleEditClose = () => {
    setOpenEditModal(false);
    setSelectedRow(null);
    setEditDateTime("");
    setDateError("");
  };

    const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
    };

    const validateDateTime = (value) => {
    if (!value) {
        return "Please select a date and time";
    }

    const now = new Date();
    now.setSeconds(0, 0);

    const minTime = new Date(now.getTime() + 6 * 60 * 1000);

  const selectedTime = new Date(value);

  if (selectedTime < minTime) {
    return `Scheduled time must be at least 5 minutes after ${formatTime(now)}`;
  }

    return "";
    };

  const handleEditSave = async () => {
    try {
        const error = validateDateTime(editDateTime);

        if (error) {
            setDateError(error);
            return;
        }
        
      const utcScheduledTime = new Date(editDateTime).toISOString();
      const res = await ApiUtils.UpdateScheduledUpload({
        fileId : selectedRow?.fileId,
        scheduledTime: utcScheduledTime,
      });
      
      if (res?.data?.isSuccess) {
      toast.success("Scheduled time updated successfully ");
      
      fetchData(params);
      handleEditClose();
    } else {
      toast.error(res?.data?.message || "Failed to update schedule");
      handleEditClose();

    }
    } catch (error) {
      console.error("Update error:", error);
    }
  };


  const handleDelete = async (data, setParentChecked, setChildCheckedState) => {
    await CommonDeleteModal({
      data,
      fetchData,
      onError: (error) => {
        console.error("Delete error:", error);
      },
      deleteFuntion: ApiUtils.DeleteScheduledUpload,
      Url: "FileSchedule/DeleteFileSchedule",
      setParentChecked,
      setChildCheckedState,
    });
  };

  const handleDownload = async (fileId, fileName) => {
  try {
    const res = await ApiUtils.scheduleFileDownload(fileId);

    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed", err);
  }
};

const columns = [
  {
  field: "fileType",
  headerName: "File Type",
  flex: 1,
  valueGetter: (params) => FILE_TYPE_MAP[params.row.fileType] || "Unknown",
},

  {
    field: "fileName",
    headerName: "File Name",
    flex: 1.5,
    valueGetter: (params) => params.row.fileName,
  },{
    field: "scheduledTime",
    headerName: "Date",
    flex: 1,
    valueGetter: (params) => extractDate(params.row.scheduledTime),
  },
  {
    field: "scheduledTimePart",
    headerName: "Time",
    flex: 1,
    valueGetter: (params) => extractTime(params.row.scheduledTime),
  },
    {
    field: "fileDownload",
    headerName: "File Download",
    flex: 1,
    renderCell: (params) => (
      <IconButton
        size="small"
        title={params.row.fileName}
        onClick={() =>
      handleDownload(params.row.fileId, params.row.fileName)
    }
      >
        <Download sx={{ fontSize: "20px", color: "#1E88E5" }} />
      </IconButton>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    renderCell: (params) => getStatusLabel(params.row.status),
  },
  {
    field: "actions",
    headerName: "Action",
    flex: 1,
    pinnable: true,
    renderCell: (params) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
  <IconButton
    size="small"
    onClick={() => handleEditOpen(params.row)}
    sx={{
      color: "#1E88E5",
      p: "6px",
    }}
  >
    <FaPenToSquare stroke={2} size={24} />
  </IconButton>

  <IconButton
    size="small"
    onClick={() =>
      handleDelete(
        { fileId: params?.row?.fileId, deviceId: Number(userDeviceIdAsNumber) },
        setParentChecked,
        setChildCheckedState
      )
    }
    sx={{
      color: "red",
      p: "6px",
    }}
  >
    <FaTrash stroke={2} size={24} />
  </IconButton>
</Box>
    ),
  },
];

  const handlePaginationModelChange = (page) => {
    setCurrentPageNumber(page.page + 1);
    setPaginationModel({
      ...paginationModel,
      page: page.page,
    });
  };

  return (
    <>
      <MainCard content={false} title="Manage Uploads List">
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

      <Dialog
        open={openEditModal}
        onClose={handleEditClose}
        PaperProps={{
          sx: { borderRadius: "12px", minWidth: "380px" },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1rem",
            borderBottom: "1px solid #f0f0f0",
            pb: 1.5,
          }}
        >
          Edit Scheduled Time
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Typography
            sx={{ fontSize: "0.8rem", color: "#757575", mb: 0.5 }}
          >
            File
          </Typography>
          <Typography
            sx={{
              fontSize: "0.85rem",
              color: "#424242",
              fontWeight: 500,
              mb: 2.5,
              wordBreak: "break-all",
            }}
          >
            {selectedRow?.fileName}
          </Typography>

          <Typography
            sx={{ fontSize: "0.8rem", color: "#757575", mb: 0.5 }}
          >
            Scheduled Date & Time
          </Typography>
          <TextField
            type="datetime-local"
            fullWidth
            value={editDateTime}
            onChange={(e) => {
                const value = e.target.value;
                setEditDateTime(value);

                const error = validateDateTime(value);
                setDateError(error);
            }}
            error={!!dateError}
            helperText={dateError}
            inputProps={{
              min: (() => {
                const now = new Date();
                return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16);
              })(),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: "8px" }}>
          <Button
            onClick={handleEditClose}
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageUploads;