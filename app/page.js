"use client";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm the ProfessorPanel support assistant. I help with any Professor related inquiries. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    const newMessage = { role: "user", content: message };
    setMessages((prevMessages) => [
      ...prevMessages,
      newMessage,
      { role: "assistant", content: "" },
    ]);

    setMessage(""); // Clear input field

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, newMessage]),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // Parse JSON response

      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        const otherMessages = prevMessages.slice(0, -1);
        return [
          ...otherMessages,
          { ...lastMessage, content: data.content }, // Update last message with the response content
        ];
      });
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleSignOut = () => {
    // Sign out logic here
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        sx={{
          width: "100%",
          backgroundColor: "#111",
          borderBottom: "2px solid #E5383B",
          color: "#FFFFFF",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <button
          onClick={() =>
            window.open("https://github.com/alexisj890/chronicleAI", "_blank")
          }
          style={{
            all: "unset",
            cursor: "pointer",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontFamily: "Kanit, sans-serif",
              fontWeight: "900",
              textTransform: "uppercase",
              backgroundColor: "#111",
              color: "#fff",
              padding: "8px 16px", // Add padding if needed
              borderRadius: "4px", // Optional: Adds rounded corners
            }}
          >
            CS Chronicles
          </Typography>
        </button>

        <Box>
          <IconButton
            color="inherit"
            component="a"
            href="https://github.com/alexisj890"
            target="_blank"
          >
            <GitHubIcon />
          </IconButton>

          <IconButton
            color="inherit"
            component="a"
            href="https://www.linkedin.com/in/hamimc/"
            target="_blank"
          >
            <LinkedInIcon />
          </IconButton>
        </Box>
      </Box>

      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        color="#FFFFFF"
        p={2}
        sx={{
          backgroundImage: `url('/ratemyprof.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          paddingTop: "80px", // Add padding to prevent content overlap with the navbar
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: "#fff",
            backgroundColor: "#111",
            padding: "20px",
            marginTop: "30px",
            borderRadius: "20px",
            fontFamily: "Kanit, sans-serif",
            fontWeight: "900",
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: "1200px",
            "@media (max-width: 600px)": {
              fontSize: "15px",
              padding: "20px",
              borderRadius: "20px",
            },
          }}
        >
          Professor Panel - Your Next Professor Awaits
        </Typography>

        <Stack
          direction="column"
          width="100%"
          maxWidth="1200px"
          height="70vh"
          border="2px solid green"
          borderRadius={4}
          p={2}
          spacing={3}
          sx={{
            backgroundColor: "#111",
            color: "white",
            overflow: "hidden",
            mt: 2,
            "@media (max-width: 600px)": {
              height: "60vh",
            },
          }}
        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            sx={{
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "grey",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "darkgrey",
                borderRadius: "4px",
              },
              "@media (max-width: 600px)": {
                "&::-webkit-scrollbar": {
                  width: "4px",
                },
              },
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  msg.role === "assistant" ? "flex-start" : "flex-end"
                }
              >
                <Box
                  bgcolor={msg.role === "assistant" ? "green" : "#2a6129"}
                  color="white"
                  borderRadius={16}
                  padding={"16px"} // Adjust padding for better spacing
                  m={1}
                  boxShadow={3}
                  sx={{
                    color: "#FFF",
                    border: "3px solid #111",
                    maxWidth: "80%",
                    "@media (max-width: 600px)": {
                      padding: "12px",
                    },
                  }}
                >
                  {msg.content}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            color="white"
            sx={{
              "@media (max-width: 600px)": {
                flexDirection: "column",
                gap: "1rem",
              },
            }}
          >
            <TextField
              label="Enter your message here: "
              fullWidth
              multiline
              maxRows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                style: {
                  color: "white",
                },
              }}
              InputLabelProps={{
                style: {
                  color: "#FFF",
                  transition: "all 0.2s ease",
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "green",
                  },
                  "&:hover fieldset": {
                    borderColor: "green",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "green",
                  },
                },
                "& .MuiInputBase-input": {
                  overflow: "auto",
                  "@media (max-width: 600px)": {
                    fontSize: "15px",
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              sx={{
                height: "56px",
                bgcolor: "green",
                fontWeight: "bold",
                color: "#FFF",
                "@media (max-width: 600px)": {
                  width: "100%",
                  height: "48px",
                  fontSize: "0.875rem",
                },
                "&:hover": {
                  bgcolor: "#2a6129",
                  fontWeight: "bold",
                  color: "#FFF",
                },
              }}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </>
  );
}
