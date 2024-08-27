"use client";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm the ProfessorPanel support assistant. I help with any Professor related inquiries. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    setMessage("");
    const newMessage = { role: "user", content: message };
    setMessages((messages) => [
      ...messages,
      newMessage,
      { role: "assistant", content: "" },
    ]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: [...messages, newMessage] }),
    });

    if (!response.ok) {
      console.error("Failed to fetch");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = "";

    reader.read().then(function processText({ done, value }) {
      if (done) {
        return setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + result },
          ];
        });
      }
      const text = decoder.decode(value || new Uint8Array(), {
        stream: true,
      });
      result += text;
      return reader.read().then(processText);
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  
  return (
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
        "@media (max-width: 600px)": {
          padding: "1rem",
        },
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
                padding={"24px"}
                m={1}
                boxShadow={3}
                style={{
                  color: "#FFF",
                  border: "3px solid #111",
                  maxWidth: "80%",
                  "@media (max-width: 600px)": {
                    padding: "15px",
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
            "@media (maxidth: 600px)": {
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
              "@media (maxidth: 600px)": {
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
  );
}
