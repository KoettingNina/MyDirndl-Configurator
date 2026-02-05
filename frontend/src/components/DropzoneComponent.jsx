import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const DropzoneComponent = ({ disabled, orderItem, existingPost }) => {
  const [files, setFiles] = useState(null); // State to store selected files
  const [error, setError] = useState(""); // State to store error messages

  const [currentPost, setCurrentPost] = useState(existingPost); // State to store the current post

  //Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Dialog for Deletion of Inspiratio Post
  const [openDialog, setOpenDialog] = useState(false);

  // Handles file drop and validation
  const onDrop = useCallback((acceptedFiles) => {
    setError(""); //Reset error message

    let newError = ""; //temp variable to store error message

    const validFiles = acceptedFiles.find((file) => {
      const isValidType =
        file.type === "image/jpeg" || file.type === "image/png";
      const isValidSize = file.size <= 400000; //400 KB
      console.log(file.size);
      if (!isValidType) {
        newError = "Only JPG and PNG files are allowed.";
      }
      if (!isValidSize) {
        newError = "File size must be less than 400 KB.";
      }
      return isValidType && isValidSize;
    });

    if (validFiles) {
      setFiles(
        Object.assign(validFiles, {
          preview: URL.createObjectURL(validFiles),
        })
      );
    }

    setError(newError); //set the error message if any
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted: onDrop, //only process accepted files
    accept: "image/png, image/jpeg",
    disabled: disabled || !!files, // Disable if disabled prop is true or if a file is already selected

    multiple: false, //only one picture
  });

  //set if there is already an Post existing for the OrderItem
  useEffect(() => {
    if (existingPost) {
      setCurrentPost(existingPost);
      console.log("setCurrentPost", existingPost);
    }
  }, [existingPost]);

  //handle file upload
  const uploadFiles = async () => {
    const formData = new FormData();
    formData.append("wornPicture", files);

    //formData.append("postingUser", "666570510addce87404f4e1b"); // TODO angemeldeter User Beispiel: Füge Benutzer-ID hinzu
    formData.append("orderItemConnection", orderItem._id); // Order Item Id
    formData.append("likes", 0); //Set initial value for likes
    formData.append("creationDate", new Date().toISOString()); // Set current date

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const response = await axios.post(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/inspirationPosts/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      console.log("repsonse", response.data);
      setCurrentPost(response.data.savedPost);
      setFiles(null); // Reset file input
      //Snackbar for success
      setSnackbarMessage("Files uploaded successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error uploading files:", error);
      //Snackbar for error
      setSnackbarMessage("Error uploading files");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  // Handles post deletion
  const deletePost = async () => {
    console.log("currentPost._id", currentPost._id);
    try {
      await axios.delete(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/inspirationPosts/delete/${currentPost._id}`,
        { withCredentials: true }
      );
      setCurrentPost(null);
      handleCloseDialog(true);
      setSnackbarMessage("Inspiration post deleted successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage("Error deleting post");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  //remove file from the preview
  const removeFile = () => {
    if (files) {
      URL.revokeObjectURL(files.preview);
      setFiles(null);
    }
  };

  React.useEffect(() => {
    return () => {
      if (files) {
        URL.revokeObjectURL(files.preview);
      }
    };
  }, [files]);

  return (
    <Box sx={{ textAlign: "center" }}>
      {!files && !currentPost ? (
        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed #666666",
            borderRadius: "4px",
            padding: "20px",
            textAlign: "center",
            cursor: "pointer",
            color: isDragActive ? "primary.main" : "text.primary",
            backgroundColor: isDragActive
              ? "action.hover"
              : "background.default",
            mb: 2,
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? "none" : "auto",
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 30, color: "#666666" }} />
          <Typography
            variant="body1"
            color={isDragActive ? "primary.main" : "text.primary"}
          >
            {isDragActive
              ? "Drop the files here ..."
              : "Drag 'n' drop some files here, or click to select files"}
          </Typography>
          <Typography variant="body2"> PNG or JPG (max. 400KB)</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              width: 150,
              height: 150,
              position: "relative",
              "&:hover .delete-icon": {
                opacity: 1,
              },
            }}
          >
            <Box
              sx={{
                width: 150,
                height: 150,
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={
                  files
                    ? files.preview
                    : `http://${process.env.REACT_APP_BACKEND_URL}:8080/${currentPost.wornPicture}`
                }
                alt={files ? files.name : "Inspiration Post"}
                style={{ width: "100%", height: "auto" }}
              />
            </Box>
            {files && (
              <IconButton
                size="small"
                onClick={() => removeFile(files.name)}
                className="delete-icon"
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  opacity: 0,
                  transition: "opacity 0.3s",
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Paper>
        </Box>
      )}
      {/* </Grid>
        ))}
      </Grid> */}
      {currentPost && (
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Delete Inspiration Post
        </Button>
      )}

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {files && (
        <Button variant="contained" color="primary" onClick={uploadFiles}>
          Upload to Inspiration Page
        </Button>
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{"Delete Confirmation"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this inspiration post?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={deletePost} variant="contained" color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DropzoneComponent;
