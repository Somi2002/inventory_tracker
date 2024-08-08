"use client";
import { useState, useEffect } from "react";
import { firestore, storage } from "@/firebase";
import {
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import { Add, Remove, Search, PhotoCamera } from "@mui/icons-material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  getDoc,
  setDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from 'next/image';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [image, setImage] = useState(null);
  const [cameraAvailable, setCameraAvailable] = useState(false);

  useEffect(() => {
    // Check if the device has a camera
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setCameraAvailable(true))
      .catch(() => setCameraAvailable(false));

    updateInventory();
  }, []);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const addItem = async (itemName) => {
    if (!itemName) return;

    let itemRef = collection(firestore, "inventory");
    const q = query(itemRef, where("name", "==", itemName));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const newItemRef = doc(itemRef);
      let imageUrl = "";

      if (image) {
        const imageRef = ref(storage, `images/${newItemRef.id}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await setDoc(newItemRef, {
        name: itemName,
        quantity: 1,
        imageUrl,
      });
    } else {
      snapshot.forEach(async (doc) => {
        const item = doc.data();
        await setDoc(doc.ref, {
          ...item,
          quantity: item.quantity + 1,
        });
      });
    }

    setImage(null);
    setItemName("");
    handleClose();
    await updateInventory();
  };

  const removeItem = async (itemId) => {
    const itemRef = doc(firestore, "inventory", itemId);
    const itemSnap = await getDoc(itemRef);

    if (itemSnap.exists()) {
      const item = itemSnap.data();
      if (item.quantity === 1) {
        await deleteDoc(itemRef);
      } else {
        await setDoc(itemRef, {
          ...item,
          quantity: item.quantity - 1,
        });
      }
    }

    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Pantry Inventory
          </Typography>
          <Button color="inherit" onClick={handleOpen}>
            Add New Item
          </Button>
        </Toolbar>
      </AppBar>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 400,
            bgcolor: "white",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            {cameraAvailable ? (
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
              >
                Capture Image
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
            ) : (
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
              >
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => addItem(itemName)}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box my={4}>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton>
                <Search />
              </IconButton>
            ),
          }}
          sx={{ mb: 4 }}
        />
        <Grid container spacing={3}>
          {inventory
            .filter(({ name }) =>
              name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(({ id, name, quantity, imageUrl }) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <Card>
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={name}
                      width={500}
                      height={300}
                      layout="responsive"
                      objectFit="cover"
                    />
                  )}
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Quantity: {quantity}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      color="primary"
                      onClick={() => addItem(name)}
                    >
                      <Add />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => removeItem(id)}
                    >
                      <Remove />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Container>
  );
}
