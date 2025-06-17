let ioInstance;
const onlineUsers = new Map();

const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("register", ({ userId, isAdmin }) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        console.log(`✅ User ${userId} is online`);
      }
      if (isAdmin) {
        socket.join("adminRoom");
        console.log(`👑 Admin joined adminRoom: ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`❌ User ${userId} disconnected`);
          break;
        }
      }
    });
  });
};

const sendRealTimeNotification = ({
  userId,
  forAdmin = false,
  notification,
}) => {
  if (!ioInstance) {
    console.warn("⚠️ ioInstance not initialized");
    return;
  }

  if (forAdmin) {
    ioInstance.to("adminRoom").emit("new_notification", notification);
  } else if (userId) {
    const userSocketId = onlineUsers.get(userId);
    if (userSocketId) {
      ioInstance.to(userSocketId).emit("new_notification", notification);
    }
  }
};

module.exports = {
  initSocket,
  sendRealTimeNotification,
};
