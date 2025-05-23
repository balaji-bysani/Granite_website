import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/granite/SheetsList");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/granite/SheetsList");
    } catch (err) {
      setError("Google sign-in failed");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          width: 360,
          height: 440,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: 3,
          borderRadius: 5
        }}
      >
        <CardContent>
          <Typography variant="h3" align="center" fontFamily={"Times New Roman"}gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: "black", color: "white", "&:hover": { backgroundColor: "#333" }, borderRadius: 2 }}
              
            >
              Login
            </Button>
          </form>
          <Typography variant="body2" align="center" sx={{ mt: 2, color: "grey" }}>
            -  OR  -
          </Typography>
          <Box mt={2}>
            <Button
              onClick={handleGoogleLogin}
              fullWidth
              variant="contained"
              sx={{ backgroundColor: "black", color: "white", "&:hover": { backgroundColor: "#333" }, borderRadius: 2 }}
            >
              Sign in with Google
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
