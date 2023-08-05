const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const app = express();

const server = http.createServer(app);
app.use(cors());
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

const questions = [
  {
    question: "What is the capital of France?",
    answers: [
      { text: "Paris", correct: true },
      { text: "Berlin", correct: false },
      { text: "London", correct: false },
      { text: "Madrid", correct: false },
    ],
  },
  {
    question: "Which planet is known as the Red Planet?",
    answers: [
      { text: "Mars", correct: true },
      { text: "Venus", correct: false },
      { text: "Jupiter", correct: false },
      { text: "Saturn", correct: false },
    ],
  },
  {
    question: "Which gas do plants use for photosynthesis?",
    answers: [
      { text: "Oxygen", correct: false },
      { text: "Carbon Dioxide", correct: true },
      { text: "Nitrogen", correct: false },
      { text: "Helium", correct: false },
    ],
  },

  {
    question: "What is the capital of Japan?",
    answers: [
      { text: "Beijing", correct: false },
      { text: "Tokyo", correct: true },
      { text: "Seoul", correct: false },
      { text: "Bangkok", correct: false },
    ],
  },
  {
    question:
      "Which famous scientist developed the theory of general relativity?",
    answers: [
      { text: "Isaac Newton", correct: false },
      { text: "Albert Einstein", correct: true },
      { text: "Nikola Tesla", correct: false },
      { text: "Marie Curie", correct: false },
    ],
  },
  {
    question: "Which country is known as the 'Land of the Rising Sun'?",
    answers: [
      { text: "China", correct: false },
      { text: "Japan", correct: true },
      { text: "India", correct: false },
      { text: "Egypt", correct: false },
    ],
  },

  {
    question: "What is the chemical symbol for gold?",
    answers: [
      { text: "Ag", correct: false },
      { text: "Au", correct: true },
      { text: "Fe", correct: false },
      { text: "Hg", correct: false },
    ],
  },
  {
    question: "Which planet is known as the 'Morning Star' or 'Evening Star'?",
    answers: [
      { text: "Mars", correct: false },
      { text: "Venus", correct: true },
      { text: "Mercury", correct: false },
      { text: "Neptune", correct: false },
    ],
  },

  {
    question: "What is the smallest prime number?",
    answers: [
      { text: "1", correct: false },
      { text: "2", correct: true },
      { text: "3", correct: false },
      { text: "5", correct: false },
    ],
  },
  {
    question: "Which country is known as the 'Land of the Rising Sun'?",
    answers: [
      { text: "China", correct: false },
      { text: "South Korea", correct: false },
      { text: "Japan", correct: true },
      { text: "Thailand", correct: false },
    ],
  },
  {
    question: "What is the largest ocean on Earth?",
    answers: [
      { text: "Atlantic Ocean", correct: false },
      { text: "Indian Ocean", correct: false },
      { text: "Arctic Ocean", correct: false },
      { text: "Pacific Ocean", correct: true },
    ],
  },
  {
    question: "Which element has the chemical symbol 'K'?",
    answers: [
      { text: "Krypton", correct: false },
      { text: "Potassium", correct: true },
      { text: "Kryptonite", correct: false },
      { text: "Kallium", correct: false },
    ],
  },
  {
    question: "What is the capital city of India?",
    answers: [
      { text: "Mumbai", correct: false },
      { text: "New Delhi", correct: true },
      { text: "Bangalore", correct: false },
      { text: "Kolkata", correct: false },
    ],
  },
];

const rooms = {};

io.on("connection", async (socket) => {
  console.log("A user connected");
  let shouldAskNewQuestion = true; // Flag to control new question asking

  socket.on("joinRoom", (room, name) => {
    socket.join(room);
    io.to(room).emit("message", `${name} has joined the game!`);
    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        currentQuestion: null,
        correctAnswer: null,
        questionTimeout: null,
        shouldAskNewQuestion: true, // Add this flag to the room object
      };
    }

    rooms[room].players.push({ id: socket.id, name });
    console.log("line162", rooms);
    if (!rooms[room].currentQuestion) {
      askNewQuestion(room);
    }
    // if (rooms[room].shouldAskNewQuestion) {
    //   askNewQuestion(room);
    //   rooms[room].shouldAskNewQuestion = false; // Set the flag to false after asking
    // }
  });

  socket.on("submitAnswer", (room, answerIndex) => {
    const currentPlayer = rooms[room].players.find(
      (player) => player.id === socket.id
    );
    if (currentPlayer) {
      const correctAnswer = rooms[room].correctAnswer;
      const isCorrect = correctAnswer !== null && correctAnswer === answerIndex;
      currentPlayer.score = isCorrect
        ? (currentPlayer.score || 0) + 1
        : currentPlayer.score || 0;
      clearTimeout(rooms[room].questionTimeout);

      io.to(room).emit("answerResult", {
        playerName: currentPlayer.name,
        isCorrect,
        correctAnswer,
        scores: rooms[room].players.map((player) => ({
          name: player.name,
          score: player.score || 0,
        })),
      });
      //   if (!rooms[room].currentQuestion) {
      //     askNewQuestion(room);
      //   }
      setTimeout(() => {
        askNewQuestion(room);
      }, 5000); // Wait for 5 seconds before asking a new question
    }
  });

  //   socket.on("submitAnswer", (room, answerIndex) => {
  //     console.log('line203--submit-->= ',rooms)
  //     const currentPlayer = rooms[room].players.find(
  //       (player) => player.id === socket.id
  //     );
  //     if (currentPlayer) {
  //       const correctAnswer = rooms[room].correctAnswer;
  //       const isCorrect = correctAnswer !== null && correctAnswer === answerIndex;
  //       currentPlayer.score = isCorrect
  //         ? (currentPlayer.score || 0) + 1
  //         : currentPlayer.score || 0;

  //       if (rooms[room].questionTimeout) {
  //         clearTimeout(rooms[room].questionTimeout);
  //         rooms[room].questionTimeout = null;
  //       }

  //       io.to(room).emit("answerResult", {
  //         playerName: currentPlayer.name,
  //         isCorrect,
  //         correctAnswer,
  //         scores: rooms[room].players.map((player) => ({
  //           name: player.name,
  //           score: player.score || 0,
  //         })),
  //       });
  //       console.log('line228--submit-->= ',rooms)
  //       if (!rooms[room].questionTimeout) {
  //         rooms[room].questionTimeout = setTimeout(() => {
  //           io.to(room).emit("answerResult", {
  //             playerName: "No one",
  //             isCorrect: false,
  //             correctAnswer: rooms[room].correctAnswer,
  //             scores: rooms[room].players.map((player) => ({
  //               name: player.name,
  //               score: player.score || 0,
  //             })),
  //           });
  //           console.log('line240--submit-->= ',rooms)
  //           setTimeout(() => {
  //             askNewQuestion(room);
  //           }, 5000); // Wait for 5 seconds before asking a new question
  //         }, 10000); // Give players 10 seconds to answer
  //       }
  //     }
  //   });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room].players = rooms[room].players.filter(
        (player) => player.id !== socket.id
      );
    }
    console.log("A user disconnected");
  });
});

function askNewQuestion(room) {
  console.log("line260 inside new question-->", rooms);
  const randomIndex = Math.floor(Math.random() * questions.length);
  const question = questions[randomIndex];
  rooms[room].currentQuestion = question;
  const correctAnswerIndex = question.answers.findIndex(
    (answer) => answer.correct
  );

  rooms[room].correctAnswer = correctAnswerIndex;

  io.to(room).emit("newQuestion", {
    question: question.question,
    answers: question.answers.map((answer) => answer.text),
  });

  rooms[room].questionTimeout = setTimeout(() => {
    io.to(room).emit("answerResult", {
      playerName: "No one",
      isCorrect: false,
      correctAnswer: rooms[room].correctAnswer,
      scores: rooms[room].players.map((player) => ({
        name: player.name,
        score: player.score || 0,
      })),
    });

    setTimeout(() => {
      askNewQuestion(room);
    }, 5000); // Wait for 5 seconds before asking a new question
  }, 10000); // Give players 10 seconds to answer
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
